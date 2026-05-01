'use client';

import { ReactNode } from 'react';

import Image from 'next/image';

import { InvitedMember } from '@/components/ui/invite-members';
import { Community } from '@/types/community';
import { Experience } from '@/types/experience';

import { CreateTickets } from './createTickets';
import { CustomiseItinerary } from './customiseItinerary';
import { ExperienceReview } from './experienceReview';
import { PreviewDateSection } from './PreviewDateSection';
import { PreviewCommunitySection } from './PreviewCommunitySection';
import { PreviewExperienceHeader } from './PreviewExperienceHeader';
import { PreviewIncludedSection } from './PreviewIncludedSection';
import { PreviewExcludedSection } from './PreviewExcludedSection';
import { PreviewCategoriesSection } from './PreviewCategoriesSection';
import { PreviewItineraryTypeSection } from './PreviewItineraryTypeSection';
import { PreviewLocationSection } from './PreviewLocationSection';
import { PreviewMeetingSection } from './PreviewMeetingSection';
import { PreviewTicketsSection } from './PreviewTicketsSection/PreviewTicketsSection';
import { Interest } from '@/types/interest';

export type ExperienceStepId = 'community' | 'about' | 'dates-tickets' | 'guests' | 'wallet';

export const ExperienceStepSidePanel = ({
  step,
  experienceId,
  experience,
  canShowDateTickets,
  itineraryConfig,
  invitedMembers,
  invitedCommunities,
  selectedCommunity,
  selectedDate,
  selectedStartTime,
  selectedEndTime,
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
}: {
  step: ExperienceStepId;
  experienceId?: string | null;
  experience?: Experience;
  canShowDateTickets?: boolean;
  itineraryConfig?: { startDate: string; endDate: string } | null;
  invitedMembers?: InvitedMember[];
  invitedCommunities?: Community[];
  selectedCommunity?: { name: string; imageUrl: string } | null;
  selectedDate?: string | null;
  selectedStartTime?: string | null;
  selectedEndTime?: string | null;
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
    salesStartDate: string;
    salesStartTime: string;
    salesEndDate: string;
    salesEndTime: string;
  }>;
  ticketsCommissionPayer?: 'host' | 'customer' | 'split';
  onEditStep?: (step: ExperienceStepId) => void;
}) => {
  const stepPanelContent: Record<ExperienceStepId, ReactNode> = {
    community: (
      <StepPlaceholderContent
        title="Select a Community"
        description="Please add the details of the experience"
      />
    ),
    about: (
      <div className="space-y-6">
        <h2 className="text-sm font-semibold text-gray-900">Preview Experience</h2>
        <PreviewExperienceHeader
          photo={aboutPhoto || null}
          photos={aboutPhotos}
          title={aboutTitle || ''}
          description={aboutDescription || ''}
          onEdit={() => onEditStep?.('about')}
        />
        <PreviewIncludedSection
          items={aboutWhatsIncluded ? [aboutWhatsIncluded] : []}
          onEdit={() => onEditStep?.('about')}
        />
        <PreviewExcludedSection
          items={aboutWhatsNotIncluded ? [aboutWhatsNotIncluded] : []}
          onEdit={() => onEditStep?.('about')}
        />
        <PreviewCategoriesSection
          categories={aboutCategories || []}
          onEdit={() => onEditStep?.('about')}
        />
        <PreviewItineraryTypeSection
          visibility={aboutVisibility || 'public'}
          onEdit={() => onEditStep?.('about')}
        />
        <PreviewDateSection
          date={selectedDate || null}
          startTime={selectedStartTime || null}
          endTime={selectedEndTime || null}
          onEdit={() => onEditStep?.('dates-tickets')}
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
        <PreviewCommunitySection
          communityName={selectedCommunity?.name || null}
          communityImageUrl={selectedCommunity?.imageUrl || null}
          onEdit={() => onEditStep?.('community')}
        />
      </div>
    ),
    'dates-tickets': itineraryConfig ? (
      <CustomiseItinerary startDate={itineraryConfig.startDate} endDate={itineraryConfig.endDate} />
    ) : canShowDateTickets ? (
      <div className="space-y-6">
        <h2 className="text-sm font-semibold text-gray-900">Preview Experience</h2>
        <PreviewExperienceHeader
          photo={aboutPhoto || null}
          photos={aboutPhotos}
          title={aboutTitle || ''}
          description={aboutDescription || ''}
          onEdit={() => onEditStep?.('about')}
        />
        <PreviewIncludedSection
          items={aboutWhatsIncluded ? [aboutWhatsIncluded] : []}
          onEdit={() => onEditStep?.('about')}
        />
        <PreviewExcludedSection
          items={aboutWhatsNotIncluded ? [aboutWhatsNotIncluded] : []}
          onEdit={() => onEditStep?.('about')}
        />
        <PreviewCategoriesSection
          categories={aboutCategories || []}
          onEdit={() => onEditStep?.('about')}
        />
        <PreviewDateSection
          date={selectedDate || null}
          startTime={selectedStartTime || null}
          endTime={selectedEndTime || null}
          onEdit={() => onEditStep?.('dates-tickets')}
        />
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
        <PreviewTicketsSection
          tickets={ticketsItems}
          coverPhoto={aboutPhoto || undefined}
          commissionPayer={ticketsCommissionPayer}
          onEdit={() => onEditStep?.('dates-tickets')}
        />
      </div>
    ) : (
      <StepPlaceholderContent
        title="Create Tickets"
        description="Update and save experience date and time first to continue."
      />
    ),
    guests: (
      <div className="space-y-6">
        <h2 className="text-sm font-semibold text-gray-900">Preview Experience</h2>
        <PreviewExperienceHeader
          photo={aboutPhoto || null}
          photos={aboutPhotos}
          title={aboutTitle || ''}
          description={aboutDescription || ''}
          onEdit={() => onEditStep?.('about')}
        />
        <PreviewIncludedSection
          items={aboutWhatsIncluded ? [aboutWhatsIncluded] : []}
          onEdit={() => onEditStep?.('about')}
        />
        <PreviewExcludedSection
          items={aboutWhatsNotIncluded ? [aboutWhatsNotIncluded] : []}
          onEdit={() => onEditStep?.('about')}
        />
        <PreviewCategoriesSection
          categories={aboutCategories || []}
          onEdit={() => onEditStep?.('about')}
        />
        <PreviewDateSection
          date={selectedDate || null}
          startTime={selectedStartTime || null}
          endTime={selectedEndTime || null}
          onEdit={() => onEditStep?.('dates-tickets')}
        />
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
        {ticketsItems && ticketsItems.length > 0 && (
          <div className="border-t border-gray-200 pt-6">
            <PreviewTicketsSection
              tickets={ticketsItems}
              coverPhoto={aboutPhoto || undefined}
              commissionPayer={ticketsCommissionPayer}
              onEdit={() => onEditStep?.('dates-tickets')}
            />
          </div>
        )}
      </div>
    ),
    wallet: (
      <div className="space-y-6">
        <h2 className="text-sm font-semibold text-gray-900">Preview Experience</h2>
        <ExperienceReview
          experience={experience}
          invitedMembers={invitedMembers}
          invitedCommunities={invitedCommunities}
        />
        {ticketsItems && ticketsItems.length > 0 && (
          <div className="border-t border-gray-200 pt-6">
            <PreviewTicketsSection
              tickets={ticketsItems}
              coverPhoto={aboutPhoto || undefined}
              commissionPayer={ticketsCommissionPayer}
              onEdit={() => onEditStep?.('dates-tickets')}
            />
          </div>
        )}
      </div>
    ),
  };
  const content = stepPanelContent[step];

  return (
    <div className="h-full rounded-t-xl border-x border-t border-gray-200 bg-white px-12 py-6 shadow-lg">
      {content}
    </div>
  );
}

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
};
