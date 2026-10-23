'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import { useSession } from 'next-auth/react';

import {
  type ExperienceStepId,
  useCreateExperienceFlow,
} from '@/app/(experiences)/experiences/create/hooks/useCreateExperienceFlow';
import {
  pickLatestDraft,
  selectDrafts,
} from '@/app/(experiences)/experiences/create/utils/draft-progress';
import { useExperiences } from '@/app/shared/hooks/useExperiences';
import { useToast } from '@/app/shared/hooks/useToast';
import { useCreateExperienceDrawer as useCreateExperienceDrawerStore } from '@/context/CreateExperienceDrawerContext';
import { cancelExperience } from '@/services/experience';
import { Experience } from '@/types/experience';
import { parseApiError } from '@/utils/parseApiError';

// An unfinished draft is offered for resuming before the wizard opens -
// mirrors the full page's own CreateEntryState (app/(experiences)/experiences/create/page.tsx)
type CreateEntryState = 'gate' | 'wizard';

export interface DrawerStepMeta {
  id: ExperienceStepId;
  label: string;
  icon: string;
}

const STEP_META: Record<Exclude<ExperienceStepId, 'preview'>, DrawerStepMeta> = {
  'dates-type': { id: 'dates-type', label: 'Date & type', icon: 'CalendarAdd01Icon' },
  about: { id: 'about', label: 'About', icon: 'InformationCircleIcon' },
  'itinerary-days': { id: 'itinerary-days', label: 'Itinerary', icon: 'Location01Icon' },
  tickets: { id: 'tickets', label: 'Tickets', icon: 'Ticket01Icon' },
  guests: { id: 'guests', label: 'Invite guests', icon: 'UserAdd01Icon' },
  wallet: { id: 'wallet', label: 'Wallet details', icon: 'Wallet01Icon' },
};

/**
 * The step tabs for the drawer's sticky nav, per the design handoff: Review
 * is never one of these (it's reached through the header's Preview button,
 * not a tab - see `isReviewOpen` below), Itinerary only shows for itinerary
 * experiences, and Wallet details only shows for paid ones - "Free
 * experiences... there is no Wallet step."
 */
const getDrawerStepList = (
  experienceType: 'one-time' | 'multi-day' | 'itinerary',
  pricing: 'paid' | 'free',
): DrawerStepMeta[] => {
  const ids: Exclude<ExperienceStepId, 'preview'>[] = ['dates-type', 'about'];
  if (experienceType === 'itinerary') ids.push('itinerary-days');
  ids.push('tickets', 'guests');
  if (pricing === 'paid') ids.push('wallet');
  return ids.map((id) => STEP_META[id]);
};

/**
 * Everything the Create experience drawer needs: the entry gate (resume a
 * draft, or go straight to the wizard), the reused wizard hook itself (with
 * syncToUrl off, since the drawer isn't a route), and the Leave confirm -
 * net new, since every step already saves to the API immediately and there
 * is no local-only draft state to lose. See
 * context/CreateExperienceDrawerContext.tsx for the mock-free open/close
 * store this reads.
 */
export const useCreateExperienceDrawer = () => {
  const store = useCreateExperienceDrawerStore()!;
  const { isOpen, options, closeCreateExperience } = store;

  const { toast } = useToast();
  const { data: session, status: sessionStatus } = useSession();
  const userId = session?.user?.id ?? undefined;

  // A specific draft or step (Dashboard "Continue", "Manage") skips the gate
  const [entryState, setEntryState] = useState<CreateEntryState>(
    options.experienceId || options.step ? 'wizard' : 'gate',
  );
  const [isClearingDraft, setIsClearingDraft] = useState(false);
  const [isLeaveConfirmOpen, setIsLeaveConfirmOpen] = useState(false);
  const [isDiscarding, setIsDiscarding] = useState(false);
  // Separate from `entryState`: a first-time host has no draft to resolve
  // away FROM (isWizardVisible is already true), so entryState alone can't
  // tell "still on the Intro" from "dismissed it" - this does.
  const [introDismissed, setIntroDismissed] = useState(false);
  // Bypasses the Leave confirm for the one close that follows a successful
  // publish - there is nothing left to save or discard by then.
  const justPublishedRef = useRef(false);

  const {
    data: draftsResponse,
    isLoading: isLoadingDrafts,
    refetch: refetchDrafts,
  } = useExperiences(
    { page: 1, page_size: 100, hosted_by: userId },
    Boolean(userId) && entryState === 'gate',
  );

  const hostedExperiences: Experience[] = useMemo(
    () => draftsResponse?.data?.results ?? [],
    [draftsResponse],
  );
  const drafts = useMemo(() => selectDrafts(hostedExperiences), [hostedExperiences]);
  const latestDraft = useMemo(() => pickLatestDraft(drafts), [drafts]);
  // The intro screen is gated on "has this host ever created anything", not
  // on the current session's own experienceId - every returning host skips
  // straight to Date & type, per the handoff: "The intro shows only for
  // people who have never hosted."
  const hasHostedBefore = hostedExperiences.length > 0;

  const isResolvingEntry =
    entryState === 'gate' && (sessionStatus === 'loading' || isLoadingDrafts);
  const isWizardVisible = !isResolvingEntry && (entryState === 'wizard' || !latestDraft);

  const flow = useCreateExperienceFlow({
    syncToUrl: false,
    enforceCommunityGuard: false,
    experienceId: options.experienceId ?? latestDraft?.id ?? null,
    initialStep: options.step,
  });

  // The step tabs' "is-reached" state tracks the furthest step ever visited,
  // not which steps have data in them - matches the prototype's own `reached`
  // index in the handoff's "State management" section.
  const [reachedStepIndex, setReachedStepIndex] = useState(0);
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  const experienceType = flow.formData.dateType.experienceType;
  const experiencePricing = flow.formData.dateType.experiencePricing;
  const stepList = useMemo(
    () => getDrawerStepList(experienceType, experiencePricing),
    [experienceType, experiencePricing],
  );
  const activeStepIndex = Math.max(
    0,
    stepList.findIndex((step) => step.id === flow.activeStep),
  );
  const isLastStep = activeStepIndex === stepList.length - 1;

  // Shown only to a host who has never created anything and hasn't already
  // dismissed it this session - everyone else (a returning host, a resumed
  // draft, or a deep link straight to an experience/step) goes straight to
  // Date & type instead.
  const isIntro =
    isWizardVisible &&
    !introDismissed &&
    !hasHostedBefore &&
    !flow.experienceId &&
    !flow.isLoadingExperience;

  // Bumping "reached" here, rather than only inside handleStepChange below,
  // also catches the steps the flow hook advances on its own (handleSaveAbout
  // and handleSaveItineraryDays both call their own setActiveStep once the
  // save succeeds, bypassing handleStepChange entirely).
  useEffect(() => {
    if (activeStepIndex > reachedStepIndex) setReachedStepIndex(activeStepIndex);
  }, [activeStepIndex, reachedStepIndex]);

  const handleStepChange = (step: ExperienceStepId) => {
    flow.handlers.handleStepChange(step);
  };

  const openReview = () => setIsReviewOpen(true);
  const closeReview = () => setIsReviewOpen(false);

  const handleProceedToWizard = () => {
    setEntryState('wizard');
    setIntroDismissed(true);
  };

  const handleClearDraft = async () => {
    if (!latestDraft) return;

    setIsClearingDraft(true);
    try {
      await cancelExperience(latestDraft.id);
      await refetchDrafts();
      handleProceedToWizard();
    } catch (error) {
      toast({
        title: 'Error',
        description: parseApiError(error, 'Failed to clear the draft'),
        variant: 'destructive',
      });
    } finally {
      setIsClearingDraft(false);
    }
  };

  // There is nothing local to lose - every step already saved to the API -
  // so the only thing the Leave confirm protects against is walking away
  // from a draft without meaning to.
  const hasUnpublishedDraft = isWizardVisible && Boolean(flow.experienceId);

  const requestClose = () => {
    if (justPublishedRef.current || !hasUnpublishedDraft) {
      closeCreateExperience();
      return;
    }

    setIsLeaveConfirmOpen(true);
  };

  const handleSaveDraftAndExit = () => {
    setIsLeaveConfirmOpen(false);
    toast({
      title: 'Draft saved',
      description: 'Pick it up again from Host an experience. You can keep one draft at a time.',
      variant: 'success',
    });
    closeCreateExperience();
  };

  const handleKeepEditing = () => setIsLeaveConfirmOpen(false);

  const handleDiscardExperience = async () => {
    if (!flow.experienceId) return;

    setIsDiscarding(true);
    try {
      await cancelExperience(flow.experienceId);
      toast({ title: 'Draft discarded', variant: 'success' });
      setIsLeaveConfirmOpen(false);
      closeCreateExperience();
    } catch (error) {
      toast({
        title: 'Error',
        description: parseApiError(error, 'Failed to discard the experience'),
        variant: 'destructive',
      });
    } finally {
      setIsDiscarding(false);
    }
  };

  const handlePublished = () => {
    justPublishedRef.current = true;
  };

  return {
    isOpen,
    entryState,
    isResolvingEntry,
    isWizardVisible,
    latestDraft,
    isIntro,
    isClearingDraft,
    handleProceedToWizard,
    handleClearDraft,
    isLeaveConfirmOpen,
    isDiscarding,
    requestClose,
    handleSaveDraftAndExit,
    handleKeepEditing,
    handleDiscardExperience,
    handlePublished,
    flow,
    stepList,
    activeStepIndex,
    reachedStepIndex,
    isLastStep,
    handleStepChange,
    isReviewOpen,
    openReview,
    closeReview,
  };
};
