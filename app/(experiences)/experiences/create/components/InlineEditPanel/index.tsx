'use client';

import { Experience } from '@/types/experience';
import { Photo } from '@/types/photo';
import { formatDateForPreview, formatTimeForPreview } from '@/utils/date-utils';

import {
  EditCategoriesField,
  EditDescriptionField,
  EditExcludedField,
  EditIncludedField,
  EditLocationField,
  EditMeetingPointField,
  EditMeetingTimeField,
  EditTitleField,
  EditVisibilityField,
  EditPhotosPanel,
} from '../EditSections';
import { PreviewCommunitySection } from '../PreviewCommunitySection';
import { PreviewDateSection } from '../PreviewDateSection';
import { CreateExperienceAbout } from '../about';
import { CreateTickets } from '../createTickets';
import { ExperienceDates } from '../dates';
import { CreateExperienceInvites } from '../invites';
import { CreateExperienceWallet } from '../wallet';

interface InlineEditPanelProps {
  activeEditSection:
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
    | 'wallet'
    | null;
  onClose: () => void;
  experienceId: string;
  experience: Experience;
  aboutPhotos?: Photo[];
  onPhotosChange?: (photos: Photo[]) => void;
}

export const InlineEditPanel = ({
  activeEditSection,
  onClose,
  experienceId,
  experience,
  aboutPhotos = [],
  onPhotosChange,
}: InlineEditPanelProps) => {
  if (!activeEditSection) {
    // Show placeholder with PhotoUploader if no photos
    if (!aboutPhotos || aboutPhotos.length === 0) {
      return (
        <div className="space-y-6 pb-24">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Add Photos</h3>
            <p className="mt-1 text-xs text-gray-600">Upload photos to preview your experience</p>
          </div>
          <EditPhotosPanel
            photos={[]}
            experienceId={experienceId}
            onPhotosChange={onPhotosChange}
            onClose={onClose}
          />
        </div>
      );
    }

    return (
      <div className="space-y-6 pb-24">
        <div className="flex flex-col items-center justify-center space-y-4 py-6">
          <svg
            width="120"
            height="120"
            viewBox="0 0 120 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-gray-300"
          >
            <circle cx="60" cy="60" r="58" stroke="currentColor" strokeWidth="4" />
            <path
              d="M45 50C45 45.58 48.58 42 53 42C57.42 42 61 45.58 61 50C61 54.42 57.42 58 53 58C48.58 58 45 54.42 45 50Z"
              fill="currentColor"
            />
            <path
              d="M35 68C35 63.58 40.82 60 48 60H68C75.18 60 81 63.58 81 68V88C81 92.42 77.42 96 73 96H39C34.58 96 31 92.42 31 88V72C31 69.79 32.79 68 35 68Z"
              fill="currentColor"
            />
          </svg>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-900">Select any section</p>
            <p className="text-xs text-gray-600">of the experience to edit here</p>
          </div>
        </div>

        {/* Host Community */}
        {experience.hostCommunity && (
          <PreviewCommunitySection
            communityName={experience.hostCommunity.title}
            communityImageUrl={experience.hostCommunity.photos?.[0]?.photo ?? null}
          />
        )}

        {/* Date of Experience */}
        {experience.startDate && (
          <PreviewDateSection
            mode="single"
            date={formatDateForPreview(experience.startDate)}
            startTime={formatTimeForPreview(experience.startDate)}
            endTime={formatTimeForPreview(experience.endDate)}
          />
        )}
      </div>
    );
  }

  return (
    <>
      {/* About sub-sections - focused editors */}
      {activeEditSection === 'about-title' && (
        <EditTitleField
          experienceId={experienceId}
          currentTitle={experience.title}
          onSave={onClose}
          onCancel={onClose}
        />
      )}
      {activeEditSection === 'about-description' && (
        <EditDescriptionField
          experienceId={experienceId}
          currentDescription={experience.description}
          onSave={onClose}
          onCancel={onClose}
        />
      )}
      {activeEditSection === 'about-location' && (
        <EditLocationField
          experienceId={experienceId}
          currentLocation={experience.location?.formattedAddress}
          currentPlaceId={experience.location?.placeId}
          onSave={onClose}
          onCancel={onClose}
        />
      )}
      {activeEditSection === 'about-meeting-point' && (
        <EditMeetingPointField
          experienceId={experienceId}
          currentMeetingPoint={experience.meetingPoint}
          onSave={onClose}
          onCancel={onClose}
        />
      )}
      {activeEditSection === 'about-meeting-time' && (
        <EditMeetingTimeField
          experienceId={experienceId}
          currentMeetingTime={experience.meetingTime}
          onSave={onClose}
          onCancel={onClose}
        />
      )}
      {activeEditSection === 'about-categories' && (
        <EditCategoriesField
          experienceId={experienceId}
          currentCategories={experience.categories}
          onSave={onClose}
          onCancel={onClose}
        />
      )}
      {activeEditSection === 'about-visibility' && (
        <EditVisibilityField
          experienceId={experienceId}
          currentVisibility={experience.isPublic ? 'public' : 'private'}
          onSave={onClose}
          onCancel={onClose}
        />
      )}
      {activeEditSection === 'about-included' && (
        <EditIncludedField
          experienceId={experienceId}
          currentIncluded={experience.whatsIncluded}
          onSave={onClose}
          onCancel={onClose}
        />
      )}
      {activeEditSection === 'about-excluded' && (
        <EditExcludedField
          experienceId={experienceId}
          currentExcluded={experience.whatsNotIncluded}
          onSave={onClose}
          onCancel={onClose}
        />
      )}
      {activeEditSection === 'about-community' && (
        <div className="space-y-4 pb-24">
          <div className="flex flex-col items-center justify-center space-y-4 py-6">
            <p className="text-sm font-medium text-gray-900">Community editing</p>
            <p className="text-xs text-gray-600">Coming soon</p>
          </div>
        </div>
      )}

      {/* Full form sections for complex edits */}
      {activeEditSection === 'photos' && onPhotosChange && (
        <EditPhotosPanel
          photos={aboutPhotos || []}
          experienceId={experienceId}
          onPhotosChange={onPhotosChange}
          onClose={onClose}
        />
      )}
      {activeEditSection === 'dates' && (
        <ExperienceDates
          experienceId={experienceId}
          experience={experience}
          onDatesUpdatedSuccess={onClose}
          onCancel={onClose}
          hideSaveAndExit
          submitActionLabel="Save Changes"
        />
      )}
      {activeEditSection === 'tickets' && (
        <CreateTickets experienceId={experienceId} experience={experience} />
      )}
      {activeEditSection === 'invites' && (
        <CreateExperienceInvites
          experienceId={experienceId}
          experience={experience}
          hideSaveAndExit
          nextActionLabel="Save Changes"
        />
      )}
      {activeEditSection === 'wallet' && (
        <CreateExperienceWallet
          hideSaveAndExit
          cancelActionLabel="Cancel"
          previewAndPublishActionLabel="Save Changes"
        />
      )}
    </>
  );
};
