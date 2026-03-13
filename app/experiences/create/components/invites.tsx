'use client';

import { useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { InviteCommunities } from '@/components/ui/invite-communities';
import { InviteMembers, InvitedMember } from '@/components/ui/invite-members';
import { useGetUsers } from '@/hooks/auth';
import { useGetCommunities } from '@/hooks/communities';
import { useAddGuestToExperience, useUpdateExperience } from '@/hooks/experiences';
import { toast } from '@/hooks/use-toast';
import { Community } from '@/types/community';
import { Experience } from '@/types/experience';

interface CreateExperienceInvitesProps {
  experienceId?: string | null;
  experience?: Experience;
  onInvitesChange?: (members: InvitedMember[], communities: Community[]) => void;
  onNext?: () => void;
  cancelActionLabel?: string;
  saveAndExitActionLabel?: string;
  nextActionLabel?: string;
  hideSaveAndExit?: boolean;
}

export default function CreateExperienceInvites({
  experienceId,
  experience,
  onInvitesChange,
  onNext,
  cancelActionLabel = 'Cancel',
  saveAndExitActionLabel = 'Save & Exit',
  nextActionLabel = 'Next',
  hideSaveAndExit = false,
}: CreateExperienceInvitesProps) {
  const initialInvitedMembers = useMemo<InvitedMember[]>(() => {
    if (!experience?.guests?.length) {
      return [];
    }

    return experience.guests
      .filter((guest) => !!guest.email)
      .map((guest) => ({
        id: guest.id,
        name: guest.email,
        email: guest.email,
        image: '',
      }));
  }, [experience?.guests]);

  const [invitedMembers, setInvitedMembers] = useState<InvitedMember[]>(initialInvitedMembers);
  const [memberSearchQuery, setMemberSearchQuery] = useState('');

  const [invitedCommunities, setInvitedCommunities] = useState<Community[]>([]);

  useEffect(() => {
    setInvitedMembers(initialInvitedMembers);
  }, [initialInvitedMembers]);

  useEffect(() => {
    onInvitesChange?.(invitedMembers, invitedCommunities);
  }, [invitedMembers, invitedCommunities, onInvitesChange]);

  const normalizedMemberQuery = memberSearchQuery.trim();

  const { data: users = [], isFetching: isSearchingUsers } = useGetUsers(
    1,
    10,
    normalizedMemberQuery.length > 0 ? normalizedMemberQuery : undefined,
  );

  const { data: userCommunities, isFetching: isFetchingCommunities } = useGetCommunities({
    page: 1,
    enabled: true,
    following: true,
  });

  const { mutateAsync: addGuestToExperience, isPending: isAddingGuest } = useAddGuestToExperience(
    experienceId || '',
  );
  const { mutateAsync: updateExperience, isPending: isUpdatingCommunities } = useUpdateExperience(
    experienceId || '',
  );

  const handleNext = async () => {
    if (experienceId && experience) {
      try {
        await updateExperience({
          title: experience.title,
          description: experience.description || '',
          googleMapPlaceId: 'ChIJkYb7L8EXLxgRWogSMeTPg8M', // Placeholder, as location is required by API but not part of this form
          startDate: experience.startDate || '',
          endDate: experience.endDate || '',
          recurrence_rule:
            (experience as any).recurrenceRule || (experience as any).recurrence_rule || '',
          categoriesIds: experience.categories?.map((c) => c.id) || [],
          isPublic: experience.isPublic,
          invitedCommunityIds: invitedCommunities.map((c) => c.id),
          invitedGuestsEmails: [],
        });
        toast({
          title: 'Communities saved',
          description: 'Invited communities have been updated.',
          variant: 'success',
        });
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error?.message || 'Failed to update invited communities.',
          variant: 'destructive',
        });
        return;
      }
    }
    onNext?.();
  };

  const handleMemberInvited = async (members: InvitedMember[]) => {
    // Find newly added member (last one in the new array that's not in current state)
    const newMember = members.find((m) => !invitedMembers.some((existing) => existing.id === m.id));

    // Update local state first
    setInvitedMembers(members);

    // If there's a new member with an email, call the API
    if (newMember?.email && experienceId) {
      try {
        await addGuestToExperience(newMember.email);
        toast({
          title: 'Guest invited',
          description: `${newMember.name} has been invited to the experience.`,
          variant: 'success',
        });
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error?.message || 'Failed to invite guest.',
          variant: 'destructive',
        });
      }
    }
  };

  const memberSearchResults = useMemo<InvitedMember[]>(() => {
    if (!normalizedMemberQuery) {
      return [];
    }

    return users
      .map((user: any) => {
        const firstName = user.firstName || '';
        const lastName = user.lastName || '';
        const fullName = `${firstName} ${lastName}`.trim();

        return {
          id: user.id,
          name: user.displayName || fullName || user.email || 'User',
          email: user.email,
          image: user.picture,
        } as InvitedMember;
      })
      .filter((user: InvitedMember) => !invitedMembers.some((member) => member.id === user.id));
  }, [users, invitedMembers, normalizedMemberQuery]);

  const availableCommunities = useMemo<Community[]>(() => {
    if (!userCommunities?.data) {
      return [];
    }

    return userCommunities?.data?.results?.map((community: any) => ({
      id: community.id,
      title: community.title,
      photos: community.photos,
      members: community.members,
    }));
  }, [userCommunities]);

  return (
    <div className="w-full">
      <div className="bg-white">
        <h1 className="text-base font-semibold leading-tight text-gray-900">
          Invite your friends and communities
        </h1>

        <p className="mt-4 text-xs text-gray-800">
          You can share invites individually or invite members of a given Communities that you own
          or are a member of.
        </p>

        <InviteMembers
          invitedMembers={invitedMembers}
          onMembersChange={handleMemberInvited}
          searchResults={memberSearchResults}
          isSearching={isSearchingUsers || isAddingGuest}
          onSearch={(query) => {
            setMemberSearchQuery(query);
          }}
          debounceMs={500}
          className="mt-3"
        />

        <p className="mt-6 text-xs font-semibold text-gray-800">Your communities</p>
        <p className="mt-2 text-xs text-gray-700">
          Select your communities you would like to invite:
        </p>

        <InviteCommunities
          invitedCommunities={invitedCommunities}
          onCommunitiesChange={setInvitedCommunities}
          availableCommunities={availableCommunities}
          isLoading={isFetchingCommunities}
        />

        <div className="mt-8 flex items-center justify-between gap-3">
          <Button
            variant="destructive"
            type="button"
            className="bg-white p-0 text-sm text-red-500 hover:bg-white hover:text-red-600"
          >
            {cancelActionLabel}
          </Button>

          <div className="flex gap-3">
            {!hideSaveAndExit && (
              <Button
                type="button"
                variant="outline"
                className="rounded-full border-primary px-6 text-xs font-semibold text-primary"
              >
                {saveAndExitActionLabel}
              </Button>
            )}
            <Button
              type="button"
              variant="gradient"
              onClick={handleNext}
              disabled={isUpdatingCommunities}
              className="rounded-full px-6 text-xs font-semibold text-white"
            >
              {isUpdatingCommunities ? 'Saving...' : nextActionLabel}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
