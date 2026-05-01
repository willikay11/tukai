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
  aboutTitle,
  aboutDescription,
  aboutVisibility,
  aboutWhatsIncluded,
  aboutWhatsNotIncluded,
  aboutLocation,
  aboutMeetingPoint,
  aboutMeetingTime,
  aboutCategories,
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
  aboutTitle?: string;
  aboutDescription?: string;
  aboutVisibility?: 'public' | 'private';
  aboutWhatsIncluded?: string;
  aboutWhatsNotIncluded?: string;
  aboutLocation?: string;
  aboutMeetingPoint?: string;
  aboutMeetingTime?: string | null;
  aboutCategories?: string[];
  onEditStep?: (step: ExperienceStepId) => void;
}) => {
  const stepPanelContent: Record<ExperienceStepId, ReactNode> = {
    community: (
      <StepPlaceholderContent
        title="Select a Community"
        description="Choose the community where you want to host this experience."
      />
    ),
    about: (
      <div className="space-y-6">
        <h2 className="text-sm font-semibold text-gray-900">Preview Experience</h2>
        <PreviewExperienceHeader
          photo={aboutPhoto || null}
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
      </div>
    ) : (
      <StepPlaceholderContent
        title="Create Tickets"
        description="Update and save experience date and time first to continue."
      />
    ),
    guests: (
      <ExperienceReview
        experience={experience}
        invitedMembers={invitedMembers}
        invitedCommunities={invitedCommunities}
      />
    ),
    wallet: (
      <ExperienceReview
        experience={experience}
        invitedMembers={invitedMembers}
        invitedCommunities={invitedCommunities}
      />
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
