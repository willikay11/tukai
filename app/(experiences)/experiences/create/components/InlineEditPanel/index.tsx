'use client';

import { Experience } from '@/types/experience';
import { Photo } from '@/types/photo';

import { PhotoEditPanel } from '../PhotoEditPanel';
import { CreateExperienceAbout } from '../about';
import { CreateTickets } from '../createTickets';
import { ExperienceDates } from '../dates';
import { CreateExperienceInvites } from '../invites';
import { CreateExperienceWallet } from '../wallet';

interface InlineEditPanelProps {
  activeEditSection: 'about' | 'dates' | 'tickets' | 'invites' | 'wallet' | 'photos' | null;
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
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-12">
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
    );
  }

  return (
    <>
      {activeEditSection === 'about' && (
        <CreateExperienceAbout
          experience={experience}
          onClose={onClose}
          showTitle={false}
          hideSaveAndExit
          editSubmitActionLabel="Save Changes"
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
      {activeEditSection === 'photos' && onPhotosChange && (
        <PhotoEditPanel
          photos={aboutPhotos || []}
          experienceId={experienceId}
          onPhotosChange={onPhotosChange}
          onClose={onClose}
        />
      )}
    </>
  );
};
