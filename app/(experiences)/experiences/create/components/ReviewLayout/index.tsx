'use client';

import { Button } from '@/components/ui/button';
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
  invitedCommunities: Community[];
  allCommunities?: CommunityOption[];
  isPublishing?: boolean;
  onEditSection?: (
    section:
      | 'about-title'
      | 'about-description'
      | 'about-location'
      | 'about-meeting-point'
      | 'about-meeting-time'
      | 'about-categories'
      | 'about-visibility'
      | 'about-included'
      | 'about-excluded'
      | 'about-community'
      | 'photos'
      | 'dates'
      | 'tickets'
      | 'invites'
      | 'wallet',
  ) => void;
  onCancel?: () => void;
  onPublish?: () => void;
  showActionBar?: boolean;
}

export const ReviewLayout = ({
  experience,
  invitedCommunities,
  allCommunities = [],
  isPublishing = false,
  onEditSection,
  onCancel,
  onPublish,
  showActionBar = true,
}: ReviewLayoutProps) => {
  console.log('ReviewLayout rendered:', { showActionBar, isPublishing, hasOnPublish: !!onPublish });

  const handleEditClick = (
    section:
      | 'about-title'
      | 'about-description'
      | 'about-location'
      | 'about-meeting-point'
      | 'about-meeting-time'
      | 'about-categories'
      | 'about-visibility'
      | 'about-included'
      | 'about-excluded'
      | 'about-community'
      | 'photos'
      | 'dates'
      | 'tickets'
      | 'invites'
      | 'wallet',
  ) => {
    if (onEditSection) {
      onEditSection(section);
    }
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Page Header */}
      <div className="pt-6">
        <h1 className="text-2xl font-semibold text-gray-900">Review Experience</h1>
        <p className="mt-2 text-sm text-gray-600">
          Please review your experience details before publishing.
        </p>
      </div>

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
          onEdit={() => handleEditClick('about-included')}
        />
      )}

      {/* 3. What's NOT Included */}
      {experience.whatsNotIncluded && (
        <PreviewExcludedSection
          items={experience.whatsNotIncluded.split('\n').filter((item) => item.trim())}
          onEdit={() => handleEditClick('about-excluded')}
        />
      )}

      {/* 4. Categories */}
      {experience.categories && experience.categories.length > 0 && (
        <PreviewCategoriesSection
          categories={experience.categories}
          onEdit={() => handleEditClick('about-categories')}
        />
      )}

      {/* 5. Itinerary Type */}
      <PreviewItineraryTypeSection
        visibility={experience.isPublic ? 'public' : 'private'}
        onEdit={() => handleEditClick('about-visibility')}
      />

      {/* 6. Date of Experience */}
      {experience.startDate && (
        <PreviewDateSection
          mode="single"
          date={experience.startDate.split('T')[0]}
          startTime={experience.startDate.split('T')[1]?.substring(0, 5) ?? null}
          endTime={experience.endDate.split('T')[1]?.substring(0, 5) ?? null}
          onEdit={() => handleEditClick('dates')}
        />
      )}

      {/* 7. Location */}
      {experience.location && (
        <PreviewLocationSection
          location={experience.location?.formattedAddress || null}
          onEdit={() => handleEditClick('about-location')}
        />
      )}

      {/* 8. Meeting/Pick-up Point */}
      {experience.meetingPoint && (
        <PreviewMeetingSection
          meetingPoint={experience.meetingPoint}
          meetingTime={experience.meetingTime}
          onEdit={() => handleEditClick('about-meeting-point')}
        />
      )}

      {/* 9. Host Community */}
      {experience.hostCommunity && (
        <PreviewCommunitySection
          communityName={experience.hostCommunity.title}
          communityImageUrl={experience.hostCommunity.photos?.[0]?.photo ?? null}
          onEdit={() => handleEditClick('about-community')}
        />
      )}

      {/* 10. Guests */}
      <PreviewGuestsSection
        guests={experience?.guests || []}
        onEdit={() => handleEditClick('invites')}
      />

      {/* 11. Invited Communities */}
      <PreviewCommunitiesSection
        communityIds={invitedCommunities.map((c) => c.id)}
        allCommunities={allCommunities}
        onEdit={() => handleEditClick('invites')}
      />

      {/* 12. Tickets */}
      {experience.tickets && experience.tickets.length > 0 && (
        <PreviewTicketsSection
          tickets={experience.tickets}
          coverPhoto={experience.photos?.[0]?.photo}
          commissionPayer={experience.commissionPayer}
          onEdit={() => handleEditClick('tickets')}
        />
      )}

      {/* 13. Wallet Details */}
      <PreviewWalletSection
        walletType={experience.walletType}
        onEdit={() => handleEditClick('wallet')}
      />

      {/* Action Bar */}
      {showActionBar && (
        <div className="mt-8 flex items-center justify-between gap-3 pt-6">
          <button
            type="button"
            onClick={() => {
              console.log('Cancel clicked');
              onCancel?.();
            }}
            disabled={isPublishing}
            className="text-xs font-medium text-destructive hover:text-destructive/80 disabled:opacity-50"
          >
            Cancel
          </button>
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                console.log('Save & Exit clicked');
                onCancel?.();
              }}
              disabled={isPublishing}
              className="rounded-full"
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
              className="rounded-full"
            >
              {isPublishing ? 'Publishing...' : 'Publish Experience'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
