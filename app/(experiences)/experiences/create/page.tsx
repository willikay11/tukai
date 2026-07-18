'use client';

import { Suspense, useState } from 'react';

import { useRouter } from 'next/navigation';

import { CreateStepContentSkeleton, ReviewWalletsSkeleton } from '@/app/shared/components/Cards';
import { TwoPanelLayout } from '@/app/shared/components/TwoPanelLayout';
import { Drawer } from '@/components/ui/drawer';

import { ExperienceStepSidePanel } from './components/step-side-panel';
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
  const router = useRouter();
  const [isPreviewDrawerOpen, setIsPreviewDrawerOpen] = useState(false);
  const {
    activeStep,
    experienceId,
    experience,
    isLoadingExperience,
    hasUpdatedDates,
    itineraryConfig,
    invitedMembers,
    invitedCommunities,
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
    slotTemplateRecords,
  } = useCreateExperienceFlow();

  if (isCheckingCommunityAccess) {
    return (
      <main className="mt-6 grid min-h-screen grid-cols-12 items-stretch gap-4 px-4 md:px-0">
        <div className="col-span-12 mb-4 md:col-span-10 md:col-start-2 md:mx-0 lg:col-span-4 lg:col-start-3 xl:col-span-5 xl:col-start-2 3xl:col-span-3 3xl:col-start-4 4xl:col-span-2 4xl:col-start-5">
          <CreateStepContentSkeleton />
        </div>
        <div className="h-full lg:col-span-4 lg:col-start-8 xl:col-span-4 xl:col-start-8 3xl:col-span-3 3xl:col-start-8 4xl:col-span-3 4xl:col-start-8">
          <ReviewWalletsSkeleton />
        </div>
      </main>
    );
  }

  if (!hasCreatedCommunity) {
    return null;
  }

  return (
    <>
      {/* Mobile preview drawer */}
      <Drawer isOpen={isPreviewDrawerOpen} setIsOpen={setIsPreviewDrawerOpen}>
        <div className="w-full max-w-full space-y-4 overflow-hidden overflow-y-auto p-4">
          <div className="w-full max-w-full overflow-hidden">
            <ExperienceStepSidePanel
              step={activeStep}
              canShowDateTickets={
                hasUpdatedDates ||
                !!(
                  formData.dateType.experienceType === 'multi-day' &&
                  formData.dateType.multiDayStartDate &&
                  formData.dateType.multiDayEndDate
                ) ||
                !!(
                  formData.dateType.isRecurring &&
                  formData.dateType.recurrenceStartDate &&
                  formData.dateType.recurrenceEndDate
                ) ||
                !!(
                  formData.dateType.date &&
                  formData.dateType.startTime &&
                  formData.dateType.endTime
                )
              }
              isRecurring={formData.dateType.isRecurring}
              experienceType={formData.dateType.experienceType}
              itineraryConfig={itineraryConfig}
              selectedCommunity={formData.dateType.community}
              selectedDate={formData.dateType.date}
              selectedStartTime={formData.dateType.startTime}
              selectedEndTime={formData.dateType.endTime}
              selectedRecurringDays={formData.dateType.recurringDays}
              selectedTimeSlots={formData.dateType.timeSlots}
              selectedRecurrenceStartDate={formData.dateType.recurrenceStartDate}
              selectedRecurrenceEndDate={formData.dateType.recurrenceEndDate}
              multiDayStartDate={formData.dateType.multiDayStartDate}
              multiDayStartTime={formData.dateType.multiDayStartTime}
              multiDayEndDate={formData.dateType.multiDayEndDate}
              multiDayEndTime={formData.dateType.multiDayEndTime}
              aboutPhotos={formData.about.photos}
              aboutTitle={formData.about.title}
              aboutDescription={formData.about.description}
              aboutVisibility={formData.about.visibility}
              aboutWhatsIncluded={formData.about.whatsIncluded}
              aboutWhatsNotIncluded={formData.about.whatsNotIncluded}
              aboutLocation={formData.about.location}
              aboutLocationImageUrl={formData.about.placeImageUrl}
              aboutMeetingPoint={formData.about.meetingPoint}
              aboutMeetingTime={formData.about.meetingTime}
              aboutCategories={formData.about.categories}
              ticketsItems={(() => {
                return formData.tickets.items;
              })()}
              ticketsCommissionPayer={formData.tickets.commission}
              invitedGuests={formData.invite.invitedGuests.map((guest) => ({
                ...guest,
                name: guest.email.split('@')[0],
              }))}
              invitedCommunityIds={formData.invite.invitedCommunityIds}
              allCommunities={communitiesForSelector}
              selectedWallet={formData.wallet.selectedWallet}
            />
          </div>
        </div>
      </Drawer>

      <TwoPanelLayout
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
              handlePublish: handlers.handlePublish,
            }}
            isSavingExperience={isSavingExperience}
            apiError={apiError}
            registerFlusher={registerFlusher}
            isPreviewDrawerOpen={isPreviewDrawerOpen}
            setIsPreviewDrawerOpen={setIsPreviewDrawerOpen}
            slotTemplateRecords={slotTemplateRecords}
            onPreviewAndPublish={() => {
              const isWalletValid = validateWallet();

              // Try to get experience ID from state or from the experience object
              const finalExperienceId = experienceId || experience?.id;

              if (!isWalletValid) {
                console.error('Wallet validation failed', walletErrors);
                return;
              }

              console.log('Navigating to review page:', finalExperienceId);
              router.push(`/experiences/review/${finalExperienceId}`);
            }}
          />
        }
        right={
          <ExperienceStepSidePanel
            step={activeStep}
            canShowDateTickets={
              hasUpdatedDates ||
              !!(
                formData.dateType.experienceType === 'multi-day' &&
                formData.dateType.multiDayStartDate &&
                formData.dateType.multiDayEndDate
              ) ||
              !!(
                formData.dateType.isRecurring &&
                formData.dateType.recurrenceStartDate &&
                formData.dateType.recurrenceEndDate
              ) ||
              !!(formData.dateType.date && formData.dateType.startTime && formData.dateType.endTime)
            }
            isRecurring={formData.dateType.isRecurring}
            experienceType={formData.dateType.experienceType}
            itineraryConfig={itineraryConfig}
            itineraryDays={formData.itineraryDays}
            itineraryStartDate={formData.dateType.itineraryStartDate}
            selectedCommunity={formData.dateType.community}
            selectedDate={formData.dateType.date}
            selectedStartTime={formData.dateType.startTime}
            selectedEndTime={formData.dateType.endTime}
            selectedRecurringDays={formData.dateType.recurringDays}
            selectedTimeSlots={formData.dateType.timeSlots}
            selectedRecurrenceStartDate={formData.dateType.recurrenceStartDate}
            selectedRecurrenceEndDate={formData.dateType.recurrenceEndDate}
            multiDayStartDate={formData.dateType.multiDayStartDate}
            multiDayStartTime={formData.dateType.multiDayStartTime}
            multiDayEndDate={formData.dateType.multiDayEndDate}
            multiDayEndTime={formData.dateType.multiDayEndTime}
            aboutPhotos={formData.about.photos}
            aboutTitle={formData.about.title}
            aboutDescription={formData.about.description}
            aboutVisibility={formData.about.visibility}
            aboutWhatsIncluded={formData.about.whatsIncluded}
            aboutWhatsNotIncluded={formData.about.whatsNotIncluded}
            aboutLocation={formData.about.location}
              aboutLocationImageUrl={formData.about.placeImageUrl}
            aboutMeetingPoint={formData.about.meetingPoint}
            aboutMeetingTime={formData.about.meetingTime}
            aboutCategories={formData.about.categories}
            ticketsItems={formData.tickets.items}
            ticketsCommissionPayer={formData.tickets.commission}
            invitedGuests={formData.invite.invitedGuests.map((guest) => ({
              ...guest,
              name: guest.email.split('@')[0],
            }))}
            invitedCommunityIds={formData.invite.invitedCommunityIds}
            allCommunities={communitiesForSelector}
            selectedWallet={formData.wallet.selectedWallet}
          />
        }
      />
    </>
  );
}
