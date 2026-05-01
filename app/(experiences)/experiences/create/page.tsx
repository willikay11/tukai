'use client';

import { Suspense } from 'react';

import { CreateStepContentSkeleton, ReviewWalletsSkeleton } from '@/app/shared/components/Cards';

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
    dateTypeErrors,
    aboutErrors,
    ticketsErrors,
    communitiesForSelector,
    validateDateType,
    validateAbout,
    validateTickets,
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
    <main className="mt-6 grid min-h-screen grid-cols-12 items-stretch gap-4 px-4 md:px-0">
      <div className="col-span-12 mb-4 md:col-span-10 md:col-start-2 md:mx-0 lg:col-span-4 lg:col-start-3 xl:col-span-5 xl:col-start-2 3xl:col-span-3 3xl:col-start-4 4xl:col-span-2 4xl:col-start-5">
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
        />
      </div>
      <div className="h-full lg:col-span-4 lg:col-start-8 xl:col-span-4 xl:col-start-8 3xl:col-span-3 3xl:col-start-8 4xl:col-span-3 4xl:col-start-8">
        <ExperienceStepSidePanel
          step={activeStep}
          experienceId={experienceId}
          experience={experience}
          canShowDateTickets={hasUpdatedDates || (formData.dateType.date && formData.dateType.startTime && formData.dateType.endTime)}
          itineraryConfig={itineraryConfig}
          invitedMembers={invitedMembers}
          invitedCommunities={invitedCommunities}
          selectedCommunity={formData.dateType.community}
          selectedDate={formData.dateType.date}
          selectedStartTime={formData.dateType.startTime}
          selectedEndTime={formData.dateType.endTime}
          aboutPhoto={formData.about.photos?.[0] || null}
          aboutPhotos={formData.about.photos}
          aboutTitle={formData.about.title}
          aboutDescription={formData.about.description}
          aboutVisibility={formData.about.visibility}
          aboutWhatsIncluded={formData.about.whatsIncluded}
          aboutWhatsNotIncluded={formData.about.whatsNotIncluded}
          aboutLocation={formData.about.location}
          aboutMeetingPoint={formData.about.meetingPoint}
          aboutMeetingTime={formData.about.meetingTime}
          aboutCategories={formData.about.categories}
          ticketsItems={formData.tickets.items}
          ticketsCommissionPayer={formData.tickets.commission}
          onEditStep={handlers.handleStepChange}
        />
      </div>
    </main>
  );
}
