'use client';

import type { Experience } from '@/types/experience';

import { FormData } from '../../hooks/useCreateExperienceFlow';
import { CreateExperienceInvites } from '../invites';

interface InviteGuestsStepProps {
  formData: FormData['invite'];
  onChange: (data: Partial<FormData['invite']>) => void;
  experienceId?: string | null;
  experience?: Experience;
  onNext?: () => void;
  onCancel?: () => void;
}

export const InviteGuestsStep = ({
  formData,
  onChange,
  experienceId,
  experience,
  onNext,
  onCancel,
}: InviteGuestsStepProps) => {
  return (
    <CreateExperienceInvites
      experienceId={experienceId}
      experience={experience}
      onInvitesChange={(members, communities) => {
        onChange({
          invitedGuests: members,
          invitedCommunityIds: communities.map((c) => c.id),
        });
      }}
      onNext={onNext}
      cancelActionLabel="Cancel"
      saveAndExitActionLabel="Save & Exit"
      nextActionLabel="Next"
      hideSaveAndExit={false}
    />
  );
};
