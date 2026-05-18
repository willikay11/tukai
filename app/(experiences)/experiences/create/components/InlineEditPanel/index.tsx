'use client';

import { CreateExperienceAbout } from '../about';
import { ExperienceDates } from '../dates';
import { CreateTickets } from '../createTickets';
import { CreateExperienceInvites } from '../invites';
import { CreateExperienceWallet } from '../wallet';
import { PhotoEditPanel } from '../PhotoEditPanel';
import { Experience } from '@/types/experience';

interface InlineEditPanelProps {
  activeEditSection: 'about' | 'dates' | 'tickets' | 'invites' | 'wallet' | 'photos' | null;
  onClose: () => void;
  experienceId: string;
  experience: Experience;
  aboutPhotos?: string[];
  onPhotosChange?: (photos: string[]) => void;
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
    return null;
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
          photos={aboutPhotos}
          onPhotosChange={onPhotosChange}
          onClose={onClose}
        />
      )}
    </>
  );
};
