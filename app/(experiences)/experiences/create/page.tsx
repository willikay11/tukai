'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';

import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';

import { CreateStepContentSkeleton } from '@/app/shared/components/Cards';
import { TwoPanelLayout } from '@/app/shared/components/TwoPanelLayout';
import { useExperiences } from '@/app/shared/hooks/useExperiences';
import { useToast } from '@/app/shared/hooks/useToast';
import { cancelExperience } from '@/services/experience';
import { Experience } from '@/types/experience';
import { parseApiError } from '@/utils/parseApiError';

import { ResumeDraft } from './components/ResumeDraft';
import { CreateExperienceSteps } from './components/steps';
import { useCreateExperienceFlow } from './hooks/useCreateExperienceFlow';
import { pickLatestDraft, selectDrafts } from './utils/draft-progress';

// An unfinished draft is offered for resuming before the wizard opens. It is
// not a stepper step — the step pills belong to the wizard only.
type CreateEntryState = 'gate' | 'wizard';

export default function CreateExperiencePage() {
  return (
    <Suspense fallback={null}>
      <CreateExperiencePageContent />
    </Suspense>
  );
}

function CreateExperiencePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { data: session, status: sessionStatus } = useSession();
  const userId = session?.user?.id ?? undefined;

  // Editing a specific draft (Hosting "Manage", or Continue draft) must land in
  // the wizard directly — the resume screen would be a detour back to where
  // they just came from
  const experienceIdParam = searchParams.get('experienceId');

  const [entryState, setEntryState] = useState<CreateEntryState>(
    experienceIdParam ? 'wizard' : 'gate',
  );
  const [isClearingDraft, setIsClearingDraft] = useState(false);

  useEffect(() => {
    if (experienceIdParam) setEntryState('wizard');
  }, [experienceIdParam]);

  const {
    data: draftsResponse,
    isLoading: isLoadingDrafts,
    refetch: refetchDrafts,
  } = useExperiences(
    { page: 1, page_size: 100, hosted_by: userId },
    Boolean(userId) && entryState === 'gate',
  );

  const hostedExperiences: Experience[] = draftsResponse?.data?.results ?? [];
  const drafts = useMemo(() => selectDrafts(hostedExperiences), [hostedExperiences]);
  const latestDraft = useMemo(() => pickLatestDraft(drafts), [drafts]);

  // Until the session and the draft list resolve we cannot tell which screen
  // the user belongs on
  const isResolvingEntry =
    entryState === 'gate' && (sessionStatus === 'loading' || isLoadingDrafts);

  // The wizard is on screen either because the user chose to proceed, or
  // because there is no draft to resume — the community guard applies to both
  const isWizardVisible = !isResolvingEntry && (entryState === 'wizard' || !latestDraft);

  const {
    activeStep,
    experience,
    isLoadingExperience,
    isCheckingCommunityAccess,
    hasCreatedCommunity,
    handlers,
    formData,
    updateFormData,
    updateAboutFormData,
    updateTicketsFormData,
    updateInviteFormData,
    updateItineraryDays,
    dateTypeErrors,
    aboutErrors,
    ticketsErrors,
    communitiesForSelector,
    validateDateType,
    validateAbout,
    validateTickets,
    wallets,
    isWalletsLoading,
    hasSavedWallets,
    walletErrors,
    updateWalletFormData,
    validateWallet,
    walletMutations,
    isSavingExperience,
    apiError,
    registerFlusher,
    previewExperience,
    slotTemplateRecords,
  } = useCreateExperienceFlow({ enforceCommunityGuard: isWizardVisible });

  // The resume screen is open to everyone; a community is only required to
  // actually build an experience, so the redirect happens on the way in
  const handleProceedToWizard = () => {
    if (!isCheckingCommunityAccess && !hasCreatedCommunity) {
      router.push('/communities/create');
      return;
    }

    setEntryState('wizard');
  };

  // No delete endpoint exists — cancelling takes the draft out of the draft
  // list, which is what "clear" needs to mean here
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

  // Wait before deciding — showing the wizard first and swapping to the resume
  // screen once drafts arrive would be a jarring flash
  if (isResolvingEntry) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-10">
        <CreateStepContentSkeleton />
      </main>
    );
  }

  // An unfinished draft is offered for resuming; with none, the wizard opens
  // directly at the first step
  if (entryState === 'gate' && latestDraft) {
    return (
      <ResumeDraft
        draft={latestDraft}
        onContinue={() => router.push(`/experiences/create?experienceId=${latestDraft.id}`)}
        onClearAndStartFresh={handleClearDraft}
        isClearing={isClearingDraft}
      />
    );
  }

  if (isCheckingCommunityAccess) {
    return (
      <main className="mt-6 grid min-h-screen grid-cols-12 items-stretch gap-4 px-4 md:px-0">
        {/* Same columns TwoPanelLayout uses in wide mode, so the page does not
            shift when the check resolves */}
        <div className="col-span-12 mb-4 md:col-span-10 md:col-start-2 md:mx-0 3xl:col-span-8 3xl:col-start-3 4xl:col-span-6 4xl:col-start-4">
          <CreateStepContentSkeleton />
        </div>
      </main>
    );
  }

  if (!hasCreatedCommunity) {
    return null;
  }

  return (
    <>
      {/* The live inline preview panel that used to sit here (desktop right
          column + mobile drawer) has been replaced by the 'preview' step, which
          renders the real customer detail view from the in-progress form. */}
      <TwoPanelLayout
        // Always full width: the stepper spans the page so all steps are
        // visible, and each step constrains its own content
        wide
        left={
          <CreateExperienceSteps
            currentStep={activeStep}
            onStepChange={handlers.handleStepChange}
            onExperienceCreated={handlers.handleExperienceCreated}
            onDatesUpdatedSuccess={handlers.handleDatesUpdatedSuccess}
            onItineraryCustomise={handlers.handleItineraryCustomise}
            onInvitesChange={handlers.handleInvitesChange}
            experience={experience}
            isLoadingExperience={isLoadingExperience}
            formData={formData.dateType}
            updateFormData={updateFormData}
            dateTypeErrors={dateTypeErrors}
            aboutFormData={formData.about}
            updateAboutFormData={updateAboutFormData}
            aboutErrors={aboutErrors}
            ticketsFormData={formData.tickets}
            updateTicketsFormData={updateTicketsFormData}
            ticketsErrors={ticketsErrors}
            communitiesForSelector={communitiesForSelector}
            validateDateType={validateDateType}
            validateAbout={validateAbout}
            validateTickets={validateTickets}
            inviteFormData={formData.invite}
            updateInviteFormData={updateInviteFormData}
            itineraryDays={formData.itineraryDays}
            updateItineraryDays={updateItineraryDays}
            walletFormData={formData.wallet}
            updateWalletFormData={updateWalletFormData}
            walletErrors={walletErrors}
            wallets={wallets}
            isWalletsLoading={isWalletsLoading}
            hasSavedWallets={hasSavedWallets}
            walletMutations={walletMutations}
            handlers={{
              handleSaveAbout: handlers.handleSaveAbout,
              handleSaveItineraryDays: handlers.handleSaveItineraryDays,
              handleDeleteItineraryDay: handlers.handleDeleteItineraryDay,
              handlePublish: handlers.handlePublish,
              handleUpdateFeesAllocation: handlers.handleUpdateFeesAllocation,
            }}
            isSavingExperience={isSavingExperience}
            apiError={apiError}
            registerFlusher={registerFlusher}
            previewExperience={previewExperience}
            slotTemplateRecords={slotTemplateRecords}
            onPreviewAndPublish={() => {
              if (!validateWallet()) {
                console.error('Wallet validation failed', walletErrors);
                return;
              }

              // The standalone review page is gone — the Preview step is where
              // the creator checks their experience before publishing
              handlers.handleStepChange('preview');
            }}
          />
        }
      />
    </>
  );
}
