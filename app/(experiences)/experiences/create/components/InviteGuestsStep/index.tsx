'use client';

import { useCallback } from 'react';

import type { Experience } from '@/types/experience';

import { FormData } from '../../hooks/useCreateExperienceFlow';
import { CreateExperienceInvites } from '../invites';

interface InviteGuestsStepProps {
  formData: FormData['invite'];
  onChange: (data: Partial<FormData['invite']>) => void;
  experienceId?: string | null;
  experience?: Experience;
  onNext?: () => void;
  onSaveAndExit?: () => void;
  onCancel?: () => void;
  onPreview?: () => void;
}

export const InviteGuestsStep = ({
  formData,
  onChange,
  experienceId,
  experience,
  onNext,
  onSaveAndExit,
  onCancel,
  onPreview,
}: InviteGuestsStepProps) => {
  const handleInvitesChange = useCallback(
    (members, communities) => {
      onChange({
        invitedGuests: members,
        invitedCommunityIds: communities.map((c) => c.id),
      });
    },
    [onChange],
  );

  return (
    <CreateExperienceInvites
      experienceId={experienceId}
      experience={experience}
      onInvitesChange={handleInvitesChange}
      onNext={onNext}
      onPreview={onPreview}
      cancelActionLabel="Cancel"
      onSaveAndExit={onSaveAndExit}
      saveAndExitActionLabel="Save & Exit"
      nextActionLabel="Next"
      hideSaveAndExit={false}
    />
  );
};
