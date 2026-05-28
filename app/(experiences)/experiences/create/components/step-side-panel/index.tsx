'use client';

import { ReactNode } from 'react';

import Image from 'next/image';

import { InvitedMember } from '@/components/ui/invite-members';
import { Community } from '@/types/community';
import { Experience } from '@/types/experience';
import { Interest } from '@/types/interest';
import { Wallet } from '@/types/payment';

import { CommunityOption } from '../../hooks/useCreateExperienceFlow';
import { type RelativeValidityValue } from '../RelativeValidityPicker';
import { SharedExperiencePreview } from '../SharedExperiencePreview';
import { CustomiseItinerary } from '../customiseItinerary';

export type ExperienceStepId = 'community' | 'about' | 'dates-tickets' | 'guests' | 'wallet';

export type ExperienceType = 'one-time' | 'multi-day' | 'itinerary';

export const ExperienceStepSidePanel = ({
  step,
  _experienceId,
  _experience,
  canShowDateTickets,
  isRecurring = false,
  experienceType = 'one-time',
  itineraryConfig,
  _invitedMembers,
  _invitedCommunities,
  selectedCommunity,
  selectedDate,
  selectedStartTime,
  selectedEndTime,
  selectedRecurringDays,
  selectedTimeSlots,
  selectedRecurrenceStartDate,
  selectedRecurrenceEndDate,
  multiDayStartDate,
  multiDayStartTime,
  multiDayEndDate,
  multiDayEndTime,
  aboutPhoto,
  aboutPhotos,
  aboutTitle,
  aboutDescription,
  aboutVisibility,
  aboutWhatsIncluded,
  aboutWhatsNotIncluded,
  aboutLocation,
  aboutMeetingPoint,
  aboutMeetingTime,
  aboutCategories,
  ticketsItems,
  ticketsCommissionPayer,
  onEditStep,
  invitedGuests,
  invitedCommunityIds,
  allCommunities,
  selectedWallet,
}: {
  step: ExperienceStepId;
  _experienceId?: string | null;
  _experience?: Experience;
  canShowDateTickets?: boolean;
  isRecurring?: boolean;
  experienceType?: ExperienceType;
  itineraryConfig?: { startDate: string; endDate: string } | null;
  _invitedMembers?: InvitedMember[];
  _invitedCommunities?: Community[];
  selectedCommunity?: { name: string; imageUrl: string } | null;
  selectedDate?: string | null;
  selectedStartTime?: string | null;
  selectedEndTime?: string | null;
  selectedRecurringDays?: ('mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun')[];
  selectedTimeSlots?: { startTime: string | null; endTime: string | null }[];
  selectedRecurrenceStartDate?: string | null;
  selectedRecurrenceEndDate?: string | null;
  multiDayStartDate?: string | null;
  multiDayStartTime?: string | null;
  multiDayEndDate?: string | null;
  multiDayEndTime?: string | null;
  aboutPhoto?: string | null;
  aboutPhotos?: string[];
  aboutTitle?: string;
  aboutDescription?: string;
  aboutVisibility?: 'public' | 'private';
  aboutWhatsIncluded?: string;
  aboutWhatsNotIncluded?: string;
  aboutLocation?: string;
  aboutMeetingPoint?: string;
  aboutMeetingTime?: string | null;
  aboutCategories?: Interest[];
  ticketsItems?: Array<{
    id: string;
    name: string;
    quantity: number;
    amount: number;
    salesStartDate: string | null;
    salesStartTime: string | null;
    salesEndDate: string | null;
    salesEndTime: string | null;
    acceptPartialPayment: boolean;
    salesStartRelative: RelativeValidityValue | null;
    salesEndRelative: RelativeValidityValue | null;
    duplicateForEntirePeriod: boolean;
  }>;
  ticketsCommissionPayer?: 'host' | 'customer' | 'split';
  onEditStep?: (step: ExperienceStepId) => void;
  invitedGuests?: InvitedMember[];
  invitedCommunityIds?: string[];
  allCommunities?: CommunityOption[];
  selectedWallet?: Wallet;
}) => {
  const stepPanelContent: Record<ExperienceStepId, ReactNode> = {
    community: (
      <StepPlaceholderContent
        title="Select a Community"
        description="Please add the details of the experience"
      />
    ),
    about: (
      <SharedExperiencePreview
        step="about"
        experienceType={experienceType}
        isRecurring={isRecurring}
        aboutPhoto={aboutPhoto}
        aboutPhotos={aboutPhotos}
        aboutTitle={aboutTitle}
        aboutDescription={aboutDescription}
        aboutVisibility={aboutVisibility}
        aboutWhatsIncluded={aboutWhatsIncluded}
        aboutWhatsNotIncluded={aboutWhatsNotIncluded}
        aboutLocation={aboutLocation}
        aboutMeetingPoint={aboutMeetingPoint}
        aboutMeetingTime={aboutMeetingTime}
        aboutCategories={aboutCategories}
        selectedDate={selectedDate}
        selectedStartTime={selectedStartTime}
        selectedEndTime={selectedEndTime}
        selectedRecurringDays={selectedRecurringDays}
        selectedTimeSlots={selectedTimeSlots}
        selectedRecurrenceStartDate={selectedRecurrenceStartDate}
        selectedRecurrenceEndDate={selectedRecurrenceEndDate}
        multiDayStartDate={multiDayStartDate}
        multiDayStartTime={multiDayStartTime}
        multiDayEndDate={multiDayEndDate}
        multiDayEndTime={multiDayEndTime}
        selectedCommunity={selectedCommunity}
        ticketsItems={ticketsItems}
        ticketsCommissionPayer={ticketsCommissionPayer}
        invitedGuests={invitedGuests}
        invitedCommunityIds={invitedCommunityIds}
        allCommunities={allCommunities}
        onEditStep={onEditStep}
        selectedWallet={selectedWallet}
      />
    ),
    'dates-tickets': itineraryConfig ? (
      <CustomiseItinerary startDate={itineraryConfig.startDate} endDate={itineraryConfig.endDate} />
    ) : canShowDateTickets ? (
      <SharedExperiencePreview
        step="dates-tickets"
        experienceType={experienceType}
        isRecurring={isRecurring}
        aboutPhoto={aboutPhoto}
        aboutPhotos={aboutPhotos}
        aboutTitle={aboutTitle}
        aboutDescription={aboutDescription}
        aboutVisibility={aboutVisibility}
        aboutWhatsIncluded={aboutWhatsIncluded}
        aboutWhatsNotIncluded={aboutWhatsNotIncluded}
        aboutLocation={aboutLocation}
        aboutMeetingPoint={aboutMeetingPoint}
        aboutMeetingTime={aboutMeetingTime}
        aboutCategories={aboutCategories}
        selectedDate={selectedDate}
        selectedStartTime={selectedStartTime}
        selectedEndTime={selectedEndTime}
        selectedRecurringDays={selectedRecurringDays}
        selectedTimeSlots={selectedTimeSlots}
        selectedRecurrenceStartDate={selectedRecurrenceStartDate}
        selectedRecurrenceEndDate={selectedRecurrenceEndDate}
        multiDayStartDate={multiDayStartDate}
        multiDayStartTime={multiDayStartTime}
        multiDayEndDate={multiDayEndDate}
        multiDayEndTime={multiDayEndTime}
        selectedCommunity={selectedCommunity}
        ticketsItems={ticketsItems}
        ticketsCommissionPayer={ticketsCommissionPayer}
        invitedGuests={invitedGuests}
        invitedCommunityIds={invitedCommunityIds}
        allCommunities={allCommunities}
        selectedWallet={selectedWallet}
        onEditStep={onEditStep}
      />
    ) : (
      <StepPlaceholderContent
        title="Create Tickets"
        description="Update and save experience date and time first to continue."
      />
    ),
    guests: (
      <SharedExperiencePreview
        step="guests"
        experienceType={experienceType}
        isRecurring={isRecurring}
        aboutPhoto={aboutPhoto}
        aboutPhotos={aboutPhotos}
        aboutTitle={aboutTitle}
        aboutDescription={aboutDescription}
        aboutVisibility={aboutVisibility}
        aboutWhatsIncluded={aboutWhatsIncluded}
        aboutWhatsNotIncluded={aboutWhatsNotIncluded}
        aboutLocation={aboutLocation}
        aboutMeetingPoint={aboutMeetingPoint}
        aboutMeetingTime={aboutMeetingTime}
        aboutCategories={aboutCategories}
        selectedDate={selectedDate}
        selectedStartTime={selectedStartTime}
        selectedEndTime={selectedEndTime}
        selectedRecurringDays={selectedRecurringDays}
        selectedTimeSlots={selectedTimeSlots}
        selectedRecurrenceStartDate={selectedRecurrenceStartDate}
        selectedRecurrenceEndDate={selectedRecurrenceEndDate}
        multiDayStartDate={multiDayStartDate}
        multiDayStartTime={multiDayStartTime}
        multiDayEndDate={multiDayEndDate}
        multiDayEndTime={multiDayEndTime}
        selectedCommunity={selectedCommunity}
        ticketsItems={ticketsItems}
        ticketsCommissionPayer={ticketsCommissionPayer}
        invitedGuests={invitedGuests}
        invitedCommunityIds={invitedCommunityIds}
        allCommunities={allCommunities}
        selectedWallet={selectedWallet}
        onEditStep={onEditStep}
      />
    ),
    wallet: (
      <SharedExperiencePreview
        step="wallet"
        experienceType={experienceType}
        isRecurring={isRecurring}
        aboutPhoto={aboutPhoto}
        aboutPhotos={aboutPhotos}
        aboutTitle={aboutTitle}
        aboutDescription={aboutDescription}
        aboutVisibility={aboutVisibility}
        aboutWhatsIncluded={aboutWhatsIncluded}
        aboutWhatsNotIncluded={aboutWhatsNotIncluded}
        aboutLocation={aboutLocation}
        aboutMeetingPoint={aboutMeetingPoint}
        aboutMeetingTime={aboutMeetingTime}
        aboutCategories={aboutCategories}
        selectedDate={selectedDate}
        selectedStartTime={selectedStartTime}
        selectedEndTime={selectedEndTime}
        selectedRecurringDays={selectedRecurringDays}
        selectedTimeSlots={selectedTimeSlots}
        selectedRecurrenceStartDate={selectedRecurrenceStartDate}
        selectedRecurrenceEndDate={selectedRecurrenceEndDate}
        multiDayStartDate={multiDayStartDate}
        multiDayStartTime={multiDayStartTime}
        multiDayEndDate={multiDayEndDate}
        multiDayEndTime={multiDayEndTime}
        selectedCommunity={selectedCommunity}
        ticketsItems={ticketsItems}
        ticketsCommissionPayer={ticketsCommissionPayer}
        invitedGuests={invitedGuests}
        invitedCommunityIds={invitedCommunityIds}
        allCommunities={allCommunities}
        selectedWallet={selectedWallet}
        onEditStep={onEditStep}
      />
    ),
  };
  const content = stepPanelContent[step];

  return (
    <div className="h-full rounded-t-xl md:border-x md:border-t-[1px] md:border-gray-200 bg-white xs:px-4 xs:py-4 md:px-12 md:py-6 md:shadow-lg">
      {content}
    </div>
  );
};

function StepPlaceholderContent({ title, description }: { title: string; description: string }) {
  return (
    <>
      <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
      <div className="mt-6 flex flex-col items-center justify-center">
        <Image src="/images/chilling.svg" alt={title} width={240} height={240} />
        <p className="mt-4 text-center text-xs text-gray-500">{description}</p>
      </div>
    </>
  );
}
