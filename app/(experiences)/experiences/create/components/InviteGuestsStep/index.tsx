'use client';

import { useCallback } from 'react';

import { InvitedMember } from '@/components/ui/invite-members';
import type { Community } from '@/types/community';
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
    (members: InvitedMember[], communities: Community[]) => {
      onChange({
        // The invite list yields InvitedMember while this form field is typed to
        // the API's guest shape. Both carry the email the preview reads; the two
        // types have drifted and untangling them is a wider change.
        invitedGuests: members as unknown as FormData['invite']['invitedGuests'],
        invitedCommunityIds: communities.map((c) => c.id),
        // Carried through so the preview can render them without looking each
        // one up in a list that may not contain it
        invitedCommunities: communities.map((community) => ({
          id: community.id,
          name: community.title,
          imageUrl:
            community.photos?.find((photo) => photo.isCover)?.photo ??
            community.photos?.[0]?.photo ??
            '',
        })),
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
