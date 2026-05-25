'use client';

import { InvitedMember } from '@/components/ui/invite-members';
import { Interest } from '@/types/interest';

import { CommunityOption } from '../../hooks/useCreateExperienceFlow';
import { PreviewCategoriesSection } from '../PreviewCategoriesSection';
import { PreviewCommunitiesSection } from '../PreviewCommunitiesSection';
import { PreviewCommunitySection } from '../PreviewCommunitySection';
import { PreviewDateSection } from '../PreviewDateSection';
import { PreviewExcludedSection } from '../PreviewExcludedSection';
import { PreviewExperienceHeader } from '../PreviewExperienceHeader';
import { PreviewGuestsSection } from '../PreviewGuestsSection';
import { PreviewIncludedSection } from '../PreviewIncludedSection';
import { PreviewItineraryTypeSection } from '../PreviewItineraryTypeSection';
import { PreviewLocationSection } from '../PreviewLocationSection';
import { PreviewMeetingSection } from '../PreviewMeetingSection';
import { PreviewTicketsSection } from '../PreviewTicketsSection';
import { type RelativeValidityValue } from '../RelativeValidityPicker';
import { ExperienceStepId, ExperienceType } from '../step-side-panel';
import { PreviewWalletSection } from '../PreviewWalletSection';

interface SharedExperiencePreviewProps {
  step: ExperienceStepId;
  experienceType?: ExperienceType;
  isRecurring?: boolean;

  // About section data
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

  onEditStep?: (step: ExperienceStepId) => void;
}

export const SharedExperiencePreview = ({
  step,
  experienceType = 'one-time',
  isRecurring = false,
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
          onEdit={() => onEditStep?.('dates-tickets')}
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
          onEdit={() => onEditStep?.('dates-tickets')}
        />
      );
    }

    return (
      <PreviewDateSection
        mode="single"
        date={selectedDate || null}
        startTime={selectedStartTime || null}
        endTime={selectedEndTime || null}
        onEdit={() => onEditStep?.('dates-tickets')}
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

      <PreviewExperienceHeader
        photo={aboutPhoto || null}
        photos={aboutPhotos}
        title={aboutTitle || ''}
        description={aboutDescription || ''}
        onEdit={() => onEditStep?.('about')}
      />

      <PreviewIncludedSection
        items={
          aboutWhatsIncluded ? aboutWhatsIncluded.split('\n').filter((item) => item.trim()) : []
        }
        onEdit={() => onEditStep?.('about')}
      />

      <PreviewExcludedSection
        items={
          aboutWhatsNotIncluded
            ? aboutWhatsNotIncluded.split('\n').filter((item) => item.trim())
            : []
        }
        onEdit={() => onEditStep?.('about')}
      />

      <PreviewCategoriesSection
        categories={aboutCategories || []}
        onEdit={() => onEditStep?.('about')}
      />

      {renderDateSection()}

      <PreviewItineraryTypeSection
        visibility={aboutVisibility || 'public'}
        onEdit={() => onEditStep?.('about')}
      />

      <PreviewLocationSection
        location={aboutLocation || null}
        onEdit={() => onEditStep?.('about')}
      />

      <PreviewMeetingSection
        meetingPoint={aboutMeetingPoint || null}
        meetingTime={aboutMeetingTime || null}
        onEdit={() => onEditStep?.('about')}
      />

      {shouldShowCommunitySection && (
        <PreviewCommunitySection
          communityName={selectedCommunity?.name || null}
          communityImageUrl={selectedCommunity?.imageUrl || null}
          onEdit={() => onEditStep?.('community')}
        />
      )}

      {shouldShowTickets && (
        <PreviewTicketsSection
          tickets={ticketsItems}
          coverPhoto={aboutPhoto || undefined}
          commissionPayer={ticketsCommissionPayer}
          onEdit={() => onEditStep?.('dates-tickets')}
        />
      )}

      <>
        <PreviewGuestsSection
          guests={invitedGuests || []}
          onEdit={() => onEditStep?.('guests')}
        />
        <PreviewCommunitiesSection
          communityIds={invitedCommunityIds || []}
          allCommunities={allCommunities || []}
          onEdit={() => onEditStep?.('guests')}
        />
      </>

      <PreviewWalletSection
        walletType="phone"
      />
    </div>
  );
};
