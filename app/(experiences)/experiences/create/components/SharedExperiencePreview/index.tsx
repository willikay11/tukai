'use client';

import {
  PreviewCommunitiesSection,
  PreviewGuestsSection,
  PreviewLocationSection,
} from '@/app/shared/components/Preview';
import { InvitedMember } from '@/components/ui/invite-members';
import { Interest } from '@/types/interest';
import { ItineraryDayFormValue } from '@/types/itinerary';
import { Wallet } from '@/types/payment';

import { CommunityOption } from '../../hooks/useCreateExperienceFlow';
import { PreviewCategoriesSection } from '../PreviewCategoriesSection';
import { PreviewCommunitySection } from '../PreviewCommunitySection';
import { PreviewDateSection } from '../PreviewDateSection';
import { PreviewDescriptionSection } from '../PreviewDescriptionSection';
import { PreviewExcludedSection } from '../PreviewExcludedSection';
import { PreviewIncludedSection } from '../PreviewIncludedSection';
import { PreviewItinerarySection } from '../PreviewItinerarySection';
import { PreviewItineraryTypeSection } from '../PreviewItineraryTypeSection';
import { PreviewMeetingSection } from '../PreviewMeetingSection';
import { PreviewPhotoSection } from '../PreviewPhotoSection';
import { PreviewTicketsSection } from '../PreviewTicketsSection';
import { PreviewTitleSection } from '../PreviewTitleSection';
import { PreviewWalletSection } from '../PreviewWalletSection';
import { type RelativeValidityValue } from '../RelativeValidityPicker';
import { ExperienceStepId, ExperienceType } from '../step-side-panel';

interface SharedExperiencePreviewProps {
  // Which step the side panel is mirroring. Irrelevant when showAllSections is
  // set, so it is optional.
  step?: ExperienceStepId;
  // The Preview step renders this as a full summary of everything captured,
  // rather than the progressive side-panel view tied to the current step
  showAllSections?: boolean;
  experienceType?: ExperienceType;
  isRecurring?: boolean;

  // About section data
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

  // Date data
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

  // Itinerary data
  itineraryDays?: ItineraryDayFormValue[];
  itineraryStartDate?: string | null;
  itineraryEndDate?: string | null;

  // Community section
  selectedCommunity?: { name: string; imageUrl: string } | null;

  // Tickets data
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

  // Guests and communities
  invitedGuests?: InvitedMember[];
  invitedCommunityIds?: string[];
  allCommunities?: CommunityOption[];

  // Wallet
  selectedWallet?: Wallet;

  onEditStep?: (step: ExperienceStepId) => void;
}

export const SharedExperiencePreview = ({
  step,
  showAllSections = false,
  experienceType = 'one-time',
  isRecurring = false,
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
  itineraryDays = [],
  itineraryStartDate,
  itineraryEndDate,
  selectedCommunity,
  ticketsItems,
  ticketsCommissionPayer,
  invitedGuests,
  invitedCommunityIds,
  allCommunities,
  selectedWallet,
  onEditStep,
}: SharedExperiencePreviewProps) => {
  // Render date section based on experience type
  const renderDateSection = () => {
    if (experienceType === 'itinerary') {
      return (
        <PreviewDateSection
          mode="itinerary"
          startDate={itineraryStartDate || null}
          endDate={itineraryEndDate || null}
          onEdit={editHandler('community')}
        />
      );
    }

    if (experienceType === 'multi-day') {
      return (
        <PreviewDateSection
          mode="multi-day"
          startDate={multiDayStartDate || null}
          startTime={multiDayStartTime || null}
          endDate={multiDayEndDate || null}
          endTime={multiDayEndTime || null}
          onEdit={editHandler('community')}
        />
      );
    }

    if (isRecurring) {
      return (
        <PreviewDateSection
          mode="recurring"
          days={selectedRecurringDays || []}
          timeSlots={selectedTimeSlots || []}
          recurrenceStartDate={selectedRecurrenceStartDate || null}
          recurrenceEndDate={selectedRecurrenceEndDate || null}
          onEdit={editHandler('community')}
        />
      );
    }

    return (
      <PreviewDateSection
        mode="single"
        date={selectedDate || null}
        startTime={selectedStartTime || null}
        endTime={selectedEndTime || null}
        onEdit={editHandler('community')}
      />
    );
  };

  // Determine if we should show tickets section
  const shouldShowTickets =
    (showAllSections || step !== 'about') && ticketsItems && ticketsItems.length > 0;

  // Determine if we should show community section (only on about step)
  const shouldShowCommunitySection = showAllSections || step === 'about';

  // Each section's pencil jumps to the step that owns its data. Step ids are
  // legacy: 'community' is the Date & Type step, and 'dates-tickets' owns
  // tickets only — the dates themselves are captured in 'community'.
  const editHandler = (ownerStep: ExperienceStepId) =>
    onEditStep ? () => onEditStep(ownerStep) : undefined;

  return (
    <div className="space-y-5">
      {/* <h2 className="text-sm font-semibold text-gray-900">Preview Experience</h2> */}

      <PreviewPhotoSection
        photos={aboutPhotos?.map((p) => p.url) || []}
        onEdit={editHandler('about')}
      />

      {aboutTitle && <PreviewTitleSection title={aboutTitle} onEdit={editHandler('about')} />}

      {aboutDescription && (
        <PreviewDescriptionSection description={aboutDescription} onEdit={editHandler('about')} />
      )}

      {renderDateSection()}

      {experienceType === 'itinerary' && itineraryDays.length > 0 && (
        <PreviewItinerarySection
          days={itineraryDays}
          itineraryStartDate={itineraryStartDate ?? null}
          onEdit={editHandler('itinerary-days')}
        />
      )}

      <PreviewIncludedSection
        items={
          aboutWhatsIncluded ? aboutWhatsIncluded.split('\n').filter((item) => item.trim()) : []
        }
        onEdit={editHandler('about')}
      />

      <PreviewExcludedSection
        items={
          aboutWhatsNotIncluded
            ? aboutWhatsNotIncluded.split('\n').filter((item) => item.trim())
            : []
        }
        onEdit={editHandler('about')}
      />

      <PreviewCategoriesSection categories={aboutCategories || []} onEdit={editHandler('about')} />

      <PreviewItineraryTypeSection
        visibility={aboutVisibility || 'public'}
        onEdit={editHandler('about')}
      />

      <PreviewLocationSection
        location={aboutLocation || null}
        imageUrl={aboutLocationImageUrl ?? null}
        onEdit={editHandler('about')}
      />

      <PreviewMeetingSection
        meetingPoint={aboutMeetingPoint || null}
        meetingTime={aboutMeetingTime || null}
        onEdit={editHandler('about')}
      />

      {shouldShowCommunitySection && (
        <PreviewCommunitySection
          communityName={selectedCommunity?.name || null}
          communityImageUrl={selectedCommunity?.imageUrl || null}
          onEdit={editHandler('community')}
        />
      )}

      {shouldShowTickets && (
        <PreviewTicketsSection
          tickets={ticketsItems}
          coverPhoto={aboutPhotos?.[0]?.url || undefined}
          commissionPayer={ticketsCommissionPayer}
          onEdit={editHandler('dates-tickets')}
        />
      )}

      <>
        <PreviewGuestsSection guests={invitedGuests || []} onEdit={editHandler('guests')} />
        <PreviewCommunitiesSection
          communityIds={invitedCommunityIds || []}
          allCommunities={allCommunities || []}
          onEdit={editHandler('guests')}
        />
      </>

      <PreviewWalletSection wallet={selectedWallet} onEdit={editHandler('wallet')} />
    </div>
  );
};
