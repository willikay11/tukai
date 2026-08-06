'use client';

import { IconComponent } from '@/app/shared/components/Icons';
import {
  PreviewCommunitiesSection,
  PreviewGuestsSection,
  PreviewLocationSection,
} from '@/app/shared/components/Preview';
import { Button } from '@/components/ui/button';
import { Community } from '@/types/community';
import { Experience } from '@/types/experience';
import { Wallet } from '@/types/payment';

import { CommunityOption } from '../../hooks/useCreateExperienceFlow';
import { usePendingAction } from '../../hooks/usePendingAction';
import { PreviewCategoriesSection } from '../PreviewCategoriesSection';
import { PreviewCommunitySection } from '../PreviewCommunitySection';
import { PreviewDateSection } from '../PreviewDateSection';
import { PreviewDescriptionSection } from '../PreviewDescriptionSection';
import { PreviewExcludedSection } from '../PreviewExcludedSection';
import { PreviewIncludedSection } from '../PreviewIncludedSection';
import { PreviewItineraryTypeSection } from '../PreviewItineraryTypeSection';
import { PreviewMeetingSection } from '../PreviewMeetingSection';
import { PreviewPhotoSection } from '../PreviewPhotoSection';
import { PreviewTicketsSection } from '../PreviewTicketsSection';
import { PreviewTitleSection } from '../PreviewTitleSection';
import { PreviewWalletSection } from '../PreviewWalletSection';

interface ReviewLayoutProps {
  experience: Experience;
  invitedCommunities: Community[];
  wallet?: Wallet;
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
  // Resolves once the save settles, so the button can stop its spinner
  onSaveAndExit?: () => void | Promise<void>;
  onPublish?: () => void;
  showActionBar?: boolean;
}

export const ReviewLayout = ({
  experience,
  invitedCommunities,
  wallet,
  allCommunities = [],
  isPublishing = false,
  onEditSection,
  onCancel,
  onSaveAndExit,
  onPublish,
  showActionBar = true,
}: ReviewLayoutProps) => {
  const { pendingAction, runAction } = usePendingAction<'exit'>();

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
        <p className="mt-2 text-xs text-gray-600">
          Please review your experience details before publishing.
        </p>
      </div>

      {/* 1. Experience Photos */}
      {experience && (
        <PreviewPhotoSection
          photos={experience.photos?.map((p) => p.photo) || []}
          onEdit={() => handleEditClick('photos')}
        />
      )}

      {/* 1b. Experience Title */}
      {experience && experience.title && (
        <PreviewTitleSection
          title={experience.title}
          onEdit={() => handleEditClick('about-title')}
        />
      )}

      {/* 1c. Experience Description */}
      {experience && experience.description && (
        <PreviewDescriptionSection
          description={experience.description}
          onEdit={() => handleEditClick('about-description')}
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
      <PreviewWalletSection wallet={wallet} onEdit={() => handleEditClick('wallet')} />

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
              variant="outline-primary"
              onClick={() => runAction('exit', onSaveAndExit ?? onCancel)}
              disabled={isPublishing || pendingAction === 'exit'}
              className="text-xs font-semibold"
            >
              {pendingAction === 'exit' && (
                <IconComponent iconName="Loading03Icon" size={16} className="animate-spin" />
              )}
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
