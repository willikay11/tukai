'use client';

import { InvitedMember } from '@/components/ui/invite-members';
import { Interest } from '@/types/interest';
import { Wallet } from '@/types/payment';

import { CommunityOption } from '../../hooks/useCreateExperienceFlow';
import { PreviewCategoriesSection } from '../PreviewCategoriesSection';
import { PreviewCommunitiesSection } from '../PreviewCommunitiesSection';
import { PreviewCommunitySection } from '../PreviewCommunitySection';
import { PreviewDateSection } from '../PreviewDateSection';
import { PreviewDescriptionSection } from '../PreviewDescriptionSection';
import { PreviewExcludedSection } from '../PreviewExcludedSection';
import { PreviewGuestsSection } from '../PreviewGuestsSection';
import { PreviewIncludedSection } from '../PreviewIncludedSection';
import { PreviewItineraryTypeSection } from '../PreviewItineraryTypeSection';
import { PreviewLocationSection } from '../PreviewLocationSection';
import { PreviewMeetingSection } from '../PreviewMeetingSection';
import { PreviewPhotoSection } from '../PreviewPhotoSection';
import { PreviewTicketsSection } from '../PreviewTicketsSection';
import { PreviewTitleSection } from '../PreviewTitleSection';
import { PreviewWalletSection } from '../PreviewWalletSection';
import { type RelativeValidityValue } from '../RelativeValidityPicker';
import { ExperienceStepId, ExperienceType } from '../step-side-panel';

interface SharedExperiencePreviewProps {
  step: ExperienceStepId;
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
  experienceType = 'one-time',
  isRecurring = false,
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
  selectedCommunity,
  ticketsItems,
  ticketsCommissionPayer,
  invitedGuests,
  invitedCommunityIds,
  allCommunities,
  selectedWallet,
  onEditStep,
}: SharedExperiencePreviewProps) => {
  // Determine heading based on step and experience type
  const getHeading = () => {
    if (step === 'dates-tickets' && isRecurring) {
      return 'Create Tickets';
    }
    return 'Preview Experience';
  };

  // Render date section based on experience type
  const renderDateSection = () => {
    if (experienceType === 'multi-day') {
      return (
        <PreviewDateSection
          mode="multi-day"
          startDate={multiDayStartDate || null}
          startTime={multiDayStartTime || null}
          endDate={multiDayEndDate || null}
          endTime={multiDayEndTime || null}
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
        />
      );
    }

    return (
      <PreviewDateSection
        mode="single"
        date={selectedDate || null}
        startTime={selectedStartTime || null}
        endTime={selectedEndTime || null}
      />
    );
  };

  // Determine if we should show tickets section
  const shouldShowTickets = step !== 'about' && ticketsItems && ticketsItems.length > 0;

  // Determine if we should show community section (only on about step)
  const shouldShowCommunitySection = step === 'about';

  return (
    <div className="space-y-6">
      <h2 className="text-sm font-semibold text-gray-900">{getHeading()}</h2>

      <PreviewPhotoSection photos={aboutPhotos?.map((p) => p.url) || []} />

      {aboutTitle && <PreviewTitleSection title={aboutTitle} />}

      {aboutDescription && <PreviewDescriptionSection description={aboutDescription} />}

      <PreviewIncludedSection
        items={
          aboutWhatsIncluded ? aboutWhatsIncluded.split('\n').filter((item) => item.trim()) : []
        }
      />

      <PreviewExcludedSection
        items={
          aboutWhatsNotIncluded
            ? aboutWhatsNotIncluded.split('\n').filter((item) => item.trim())
            : []
        }
      />

      <PreviewCategoriesSection categories={aboutCategories || []} />

      {renderDateSection()}

      <PreviewItineraryTypeSection visibility={aboutVisibility || 'public'} />

      <PreviewLocationSection location={aboutLocation || null} />

      <PreviewMeetingSection
        meetingPoint={aboutMeetingPoint || null}
        meetingTime={aboutMeetingTime || null}
      />

      {shouldShowCommunitySection && (
        <PreviewCommunitySection
          communityName={selectedCommunity?.name || null}
          communityImageUrl={selectedCommunity?.imageUrl || null}
        />
      )}

      {shouldShowTickets && (
        <PreviewTicketsSection
          tickets={ticketsItems}
          coverPhoto={aboutPhotos?.[0]?.url || undefined}
          commissionPayer={ticketsCommissionPayer}
        />
      )}

      <>
        <PreviewGuestsSection guests={invitedGuests || []} />
        <PreviewCommunitiesSection
          communityIds={invitedCommunityIds || []}
          allCommunities={allCommunities || []}
        />
      </>

      <PreviewWalletSection wallet={selectedWallet} />
    </div>
  );
};
