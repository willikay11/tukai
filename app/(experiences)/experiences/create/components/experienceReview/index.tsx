'use client';

import { InvitedMember } from '@/components/ui/invite-members';
import { Community } from '@/types/community';
import { Experience } from '@/types/experience';

import { CommunityOption } from '../../hooks/useCreateExperienceFlow';
import { PreviewCategoriesSection } from '../PreviewCategoriesSection';
import { PreviewCommunitiesSection } from '../PreviewCommunitiesSection';
import { PreviewDateSection } from '../PreviewDateSection';
import { PreviewDescriptionSection } from '../PreviewDescriptionSection';
import { PreviewExcludedSection } from '../PreviewExcludedSection';
import { PreviewGuestsSection } from '../PreviewGuestsSection';
import { PreviewPhotoSection } from '../PreviewPhotoSection';
import { PreviewTitleSection } from '../PreviewTitleSection';
import { PreviewIncludedSection } from '../PreviewIncludedSection';
import { PreviewItineraryTypeSection } from '../PreviewItineraryTypeSection';
import { PreviewLocationSection } from '../PreviewLocationSection';
import { PreviewMeetingSection } from '../PreviewMeetingSection';
import { PreviewTicketsSection } from '../PreviewTicketsSection';
import { PreviewWalletSection } from '../PreviewWalletSection';

interface ExperienceReviewProps {
  type: 'review' | 'create';
  experience: Experience;
  invitedMembers: InvitedMember[];
  invitedCommunities: Community[];
  allCommunities?: CommunityOption[];
  onEditRequest?: (section: 'about' | 'dates' | 'tickets' | 'invites' | 'wallet') => void;
}

export const ExperienceReview = ({
  type,
  experience,
  invitedMembers,
  invitedCommunities,
  allCommunities = [],
  onEditRequest,
}: ExperienceReviewProps) => {
  const handleEditClick = (section: 'about' | 'dates' | 'tickets' | 'invites' | 'wallet') => {
    if (onEditRequest) {
      onEditRequest(section);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-sm font-semibold text-gray-900">
        {type === 'review' ? 'Review Your Experience' : 'Experience Preview'}
      </h2>

      <PreviewPhotoSection
        photos={experience.photos?.map((p) => p.photo) || []}
        onEdit={() => handleEditClick('about')}
      />

      {experience.title && (
        <PreviewTitleSection
          title={experience.title}
          onEdit={() => handleEditClick('about')}
        />
      )}

      {experience.description && (
        <PreviewDescriptionSection
          description={experience.description}
          onEdit={() => handleEditClick('about')}
        />
      )}

      {experience.whatsIncluded && (
        <PreviewIncludedSection
          items={experience.whatsIncluded.split('\n').filter((item) => item.trim())}
          onEdit={() => handleEditClick('about')}
        />
      )}

      {experience.whatsNotIncluded && (
        <PreviewExcludedSection
          items={experience.whatsNotIncluded.split('\n').filter((item) => item.trim())}
          onEdit={() => handleEditClick('about')}
        />
      )}

      {experience.categories && experience.categories.length > 0 && (
        <PreviewCategoriesSection
          categories={experience.categories}
          onEdit={() => handleEditClick('about')}
        />
      )}

      {experience.startDate && (
        <PreviewDateSection
          date={experience.startDate}
          startTime={experience.startTime}
          endTime={experience.endTime}
          onEdit={() => handleEditClick('dates')}
        />
      )}

      {experience.experienceType && (
        <PreviewItineraryTypeSection
          type={experience.experienceType}
          onEdit={() => handleEditClick('dates')}
        />
      )}

      {experience.location && (
        <PreviewLocationSection
          location={experience.location}
          onEdit={() => handleEditClick('about')}
        />
      )}

      {experience.meetingPoint && (
        <PreviewMeetingSection
          meetingPoint={experience.meetingPoint}
          meetingTime={experience.meetingTime}
          onEdit={() => handleEditClick('about')}
        />
      )}

      <PreviewGuestsSection guests={invitedMembers} onEdit={() => handleEditClick('invites')} />

      <PreviewCommunitiesSection
        communityIds={invitedCommunities.map((c) => c.id)}
        allCommunities={allCommunities}
        onEdit={() => handleEditClick('invites')}
      />

      {experience.tickets && experience.tickets.length > 0 && (
        <div className="border-t border-gray-200 pt-6">
          <PreviewTicketsSection
            tickets={experience.tickets}
            commissionPayer={experience.commissionPayer}
            onEdit={() => handleEditClick('tickets')}
          />
        </div>
      )}

      <PreviewWalletSection
        walletType={experience.walletType}
        onEdit={() => handleEditClick('wallet')}
      />
    </div>
  );
};
