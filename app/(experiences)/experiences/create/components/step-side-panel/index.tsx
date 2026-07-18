'use client';

import { ReactNode } from 'react';

import { PreviewPanel } from '@/app/shared/components/PreviewPanel';
import { InvitedMember } from '@/components/ui/invite-members';
import { Interest } from '@/types/interest';
import { ItineraryDayFormValue } from '@/types/itinerary';
import { Wallet } from '@/types/payment';

import { CommunityOption } from '../../hooks/useCreateExperienceFlow';
import { type RelativeValidityValue } from '../RelativeValidityPicker';
import { SharedExperiencePreview } from '../SharedExperiencePreview';
import { CustomiseItinerary } from '../customiseItinerary';

export type ExperienceStepId =
  | 'community'
  | 'about'
  | 'itinerary-days'
  | 'dates-tickets'
  | 'guests'
  | 'wallet';

export type ExperienceType = 'one-time' | 'multi-day' | 'itinerary';

export const ExperienceStepSidePanel = ({
  step,
  canShowDateTickets,
  isRecurring = false,
  experienceType = 'one-time',
  itineraryConfig,
  itineraryDays = [],
  itineraryStartDate,
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
  aboutPhotos,
  aboutTitle,
  aboutDescription,
  aboutVisibility,
  aboutWhatsIncluded,
  aboutWhatsNotIncluded,
  aboutLocation,
  aboutLocationImageUrl,
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
  canShowDateTickets?: boolean;
  isRecurring?: boolean;
  experienceType?: ExperienceType;
  itineraryConfig?: { startDate: string; endDate: string } | null;
  itineraryDays?: ItineraryDayFormValue[];
  itineraryStartDate?: string | null;
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
  aboutPhotos?: Array<{ id: string; url: string; isTempId?: boolean }>;
  aboutTitle?: string;
  aboutDescription?: string;
  aboutVisibility?: 'public' | 'private';
  aboutWhatsIncluded?: string;
  aboutWhatsNotIncluded?: string;
  aboutLocation?: string;
  aboutLocationImageUrl?: string | null;
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
    community: null,
    about: (
      <SharedExperiencePreview
        step="about"
        experienceType={experienceType}
        isRecurring={isRecurring}
        aboutPhotos={aboutPhotos}
        aboutTitle={aboutTitle}
        aboutDescription={aboutDescription}
        aboutVisibility={aboutVisibility}
        aboutWhatsIncluded={aboutWhatsIncluded}
        aboutWhatsNotIncluded={aboutWhatsNotIncluded}
        aboutLocation={aboutLocation}
        aboutLocationImageUrl={aboutLocationImageUrl}
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
        itineraryDays={itineraryDays}
        itineraryStartDate={itineraryStartDate}
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
    'itinerary-days': (
      <SharedExperiencePreview
        step="about"
        experienceType={experienceType}
        isRecurring={isRecurring}
        aboutPhotos={aboutPhotos}
        aboutTitle={aboutTitle}
        aboutDescription={aboutDescription}
        aboutVisibility={aboutVisibility}
        aboutWhatsIncluded={aboutWhatsIncluded}
        aboutWhatsNotIncluded={aboutWhatsNotIncluded}
        aboutLocation={aboutLocation}
        aboutLocationImageUrl={aboutLocationImageUrl}
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
        itineraryDays={itineraryDays}
        itineraryStartDate={itineraryStartDate}
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
        aboutPhotos={aboutPhotos}
        aboutTitle={aboutTitle}
        aboutDescription={aboutDescription}
        aboutVisibility={aboutVisibility}
        aboutWhatsIncluded={aboutWhatsIncluded}
        aboutWhatsNotIncluded={aboutWhatsNotIncluded}
        aboutLocation={aboutLocation}
        aboutLocationImageUrl={aboutLocationImageUrl}
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
        itineraryDays={itineraryDays}
        itineraryStartDate={itineraryStartDate}
        selectedCommunity={selectedCommunity}
        ticketsItems={ticketsItems}
        ticketsCommissionPayer={ticketsCommissionPayer}
        invitedGuests={invitedGuests}
        invitedCommunityIds={invitedCommunityIds}
        allCommunities={allCommunities}
        selectedWallet={selectedWallet}
        onEditStep={onEditStep}
      />
    ) : null,
    guests: (
      <SharedExperiencePreview
        step="guests"
        experienceType={experienceType}
        isRecurring={isRecurring}
        aboutPhotos={aboutPhotos}
        aboutTitle={aboutTitle}
        aboutDescription={aboutDescription}
        aboutVisibility={aboutVisibility}
        aboutWhatsIncluded={aboutWhatsIncluded}
        aboutWhatsNotIncluded={aboutWhatsNotIncluded}
        aboutLocation={aboutLocation}
        aboutLocationImageUrl={aboutLocationImageUrl}
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
        itineraryDays={itineraryDays}
        itineraryStartDate={itineraryStartDate}
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
        aboutPhotos={aboutPhotos}
        aboutTitle={aboutTitle}
        aboutDescription={aboutDescription}
        aboutVisibility={aboutVisibility}
        aboutWhatsIncluded={aboutWhatsIncluded}
        aboutWhatsNotIncluded={aboutWhatsNotIncluded}
        aboutLocation={aboutLocation}
        aboutLocationImageUrl={aboutLocationImageUrl}
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
        itineraryDays={itineraryDays}
        itineraryStartDate={itineraryStartDate}
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

  // Determine if we should show empty state
  const isEmpty = step === 'community' || (step === 'dates-tickets' && !canShowDateTickets);

  return (
    <PreviewPanel
      title={
        isEmpty
          ? step === 'community'
            ? 'Preview Community'
            : 'Create Tickets'
          : 'Preview Experience'
      }
      isEmpty={isEmpty}
      emptyText={
        step === 'community'
          ? 'Please add the details of the experience'
          : 'Update and save experience date and time first to continue.'
      }
    >
      {!isEmpty && content}
    </PreviewPanel>
  );
};
