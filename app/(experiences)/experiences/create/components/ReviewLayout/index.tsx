'use client';

import { Button } from '@/components/ui/button';
import { InvitedMember } from '@/components/ui/invite-members';
import { Community } from '@/types/community';
import { Experience } from '@/types/experience';

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
import { PreviewWalletSection } from '../PreviewWalletSection';

interface ReviewLayoutProps {
  experience: Experience;
  invitedMembers: InvitedMember[];
  invitedCommunities: Community[];
  selectedCommunity?: { name: string; imageUrl: string } | null;
  allCommunities?: CommunityOption[];
  isPublishing?: boolean;
  onEditSection?: (
    section: 'about' | 'dates' | 'tickets' | 'invites' | 'wallet' | 'photos',
  ) => void;
  onCancel?: () => void;
  onPublish?: () => void;
  showActionBar?: boolean;
}

export const ReviewLayout = ({
  experience,
  invitedMembers,
  invitedCommunities,
  selectedCommunity,
  allCommunities = [],
  isPublishing = false,
  onEditSection,
  onCancel,
  onPublish,
  showActionBar = true,
}: ReviewLayoutProps) => {
  console.log('ReviewLayout rendered:', { showActionBar, isPublishing, hasOnPublish: !!onPublish });

  const handleEditClick = (
    section: 'about' | 'dates' | 'tickets' | 'invites' | 'wallet' | 'photos',
  ) => {
    if (onEditSection) {
      onEditSection(section);
    }
  };

  return (
    <div className="space-y-6 pb-24">
      {/* 1. Experience Photo Header */}
      {experience && (
        <PreviewExperienceHeader
          photo={experience.photos?.[0]?.photo || null}
          photos={experience.photos?.map((p) => p.photo) || []}
          title={experience.title || ''}
          description={experience.description || ''}
          onEdit={() => handleEditClick('photos')}
        />
      )}

      {/* 2. What's Included */}
      {experience.whatsIncluded && (
        <PreviewIncludedSection
          items={experience.whatsIncluded.split('\n').filter((item) => item.trim())}
          onEdit={() => handleEditClick('about')}
        />
      )}

      {/* 3. What's NOT Included */}
      {experience.whatsNotIncluded && (
        <PreviewExcludedSection
          items={experience.whatsNotIncluded.split('\n').filter((item) => item.trim())}
          onEdit={() => handleEditClick('about')}
        />
      )}

      {/* 4. Categories */}
      {experience.categories && experience.categories.length > 0 && (
        <PreviewCategoriesSection
          categories={experience.categories}
          onEdit={() => handleEditClick('about')}
        />
      )}

      {/* 5. Itinerary Type */}
      {experience.experienceType && (
        <PreviewItineraryTypeSection
          type={experience.experienceType}
          onEdit={() => handleEditClick('dates')}
        />
      )}

      {/* 6. Date of Experience */}
      {experience.startDate && (
        <PreviewDateSection
          date={experience.startDate}
          startTime={experience.startTime}
          endTime={experience.endTime}
          onEdit={() => handleEditClick('dates')}
        />
      )}

      {/* 7. Location */}
      {experience.location && (
        <PreviewLocationSection
          location={experience.location?.formattedAddress || null}
          onEdit={() => handleEditClick('about')}
        />
      )}

      {/* 8. Meeting/Pick-up Point */}
      {experience.meetingPoint && (
        <PreviewMeetingSection
          meetingPoint={experience.meetingPoint}
          meetingTime={experience.meetingTime}
          onEdit={() => handleEditClick('about')}
        />
      )}

      {/* 9. Host Community */}
      {selectedCommunity && (
        <PreviewCommunitySection
          communityName={selectedCommunity.name}
          communityImageUrl={selectedCommunity.imageUrl}
          onEdit={() => handleEditClick('about')}
        />
      )}

      {/* 10. Guests */}
      <PreviewGuestsSection guests={invitedMembers} onEdit={() => handleEditClick('invites')} />

      {/* 11. Invited Communities */}
      <PreviewCommunitiesSection
        communityIds={invitedCommunities.map((c) => c.id)}
        allCommunities={allCommunities}
        onEdit={() => handleEditClick('invites')}
      />

      {/* 12. Tickets */}
      {experience.tickets && experience.tickets.length > 0 && (
        <div className="border-t border-gray-200 pt-6">
          <PreviewTicketsSection
            tickets={experience.tickets}
            commissionPayer={experience.commissionPayer}
            onEdit={() => handleEditClick('tickets')}
          />
        </div>
      )}

      {/* 13. Wallet Details */}
      <PreviewWalletSection
        walletType={experience.walletType}
        onEdit={() => handleEditClick('wallet')}
      />

      {/* Action Bar */}
      {showActionBar && (
        <div className="sticky bottom-0 left-0 right-0 z-40 flex gap-3 border-t border-gray-200 bg-white pb-4 pt-6 shadow-lg">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              console.log('Cancel clicked');
              onCancel?.();
            }}
            disabled={isPublishing}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              console.log('Save & Exit clicked');
              onCancel?.();
            }}
            disabled={isPublishing}
            className="flex-1"
          >
            Save & Exit
          </Button>
          <Button
            type="button"
            variant="gradient"
            onClick={() => {
              console.log('Publish button clicked - calling onPublish');
              onPublish?.();
            }}
            disabled={isPublishing}
            className="flex-1"
          >
            {isPublishing ? 'Publishing...' : 'Publish'}
          </Button>
        </div>
      )}
    </div>
  );
};
