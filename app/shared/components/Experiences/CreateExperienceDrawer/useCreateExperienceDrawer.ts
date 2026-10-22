'use client';

import { useMemo, useRef, useState } from 'react';

import { useSession } from 'next-auth/react';

import { useCreateExperienceFlow } from '@/app/(experiences)/experiences/create/hooks/useCreateExperienceFlow';
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

  const drafts = useMemo(() => {
    const hostedExperiences: Experience[] = draftsResponse?.data?.results ?? [];
    return selectDrafts(hostedExperiences);
  }, [draftsResponse]);
  const latestDraft = useMemo(() => pickLatestDraft(drafts), [drafts]);

  const isResolvingEntry =
    entryState === 'gate' && (sessionStatus === 'loading' || isLoadingDrafts);
  const isWizardVisible = !isResolvingEntry && (entryState === 'wizard' || !latestDraft);

  const flow = useCreateExperienceFlow({
    syncToUrl: false,
    enforceCommunityGuard: false,
    experienceId: options.experienceId ?? latestDraft?.id ?? null,
    initialStep: options.step,
  });

  const handleProceedToWizard = () => setEntryState('wizard');

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
  };
};
