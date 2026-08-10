'use client';

import { Suspense } from 'react';

import { CreateStepContentSkeleton } from '@/app/shared/components/Cards';
import { TwoPanelLayout } from '@/app/shared/components/TwoPanelLayout';

import { CreateExperienceSteps } from './components/steps';
import { useCreateExperienceFlow } from './hooks/useCreateExperienceFlow';

export default function CreateExperiencePage() {
  return (
    <Suspense fallback={null}>
      <CreateExperiencePageContent />
    </Suspense>
  );
}

function CreateExperiencePageContent() {
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
  } = useCreateExperienceFlow();

  if (isCheckingCommunityAccess) {
    return (
      <main className="mt-6 grid min-h-screen grid-cols-12 items-stretch gap-4 px-4 md:px-0">
        <div className="col-span-12 mb-4 md:col-span-10 md:col-start-2 md:mx-0 lg:col-span-4 lg:col-start-3 xl:col-span-5 xl:col-start-2 3xl:col-span-3 3xl:col-start-4 4xl:col-span-2 4xl:col-start-5">
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
