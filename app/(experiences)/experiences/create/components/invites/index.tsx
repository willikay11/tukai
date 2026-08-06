'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { IconComponent } from '@/app/shared/components/Icons';
import { useGetCommunities } from '@/app/shared/hooks/useCommunities';
import {
  useAddGuestToExperience,
  useSearchUsersDebounced,
  useUpdateExperience,
} from '@/app/shared/hooks/useExperiences';
import { toast } from '@/app/shared/hooks/useToast';
import { Button } from '@/components/ui/button';
import { InviteCommunities } from '@/components/ui/invite-communities';
import { InviteMembers, InvitedMember } from '@/components/ui/invite-members';
import { Community } from '@/types/community';
import { Experience } from '@/types/experience';

import { usePendingAction } from '../../hooks/usePendingAction';

interface CreateExperienceInvitesProps {
  experienceId?: string | null;
  experience?: Experience;
  onInvitesChange?: (members: InvitedMember[], communities: Community[]) => void;
  onNext?: () => void;
  // Resolves once the save settles, so the button can stop its spinner
  onSaveAndExit?: () => void | Promise<void>;
  onPreview?: () => void;
  cancelActionLabel?: string;
  saveAndExitActionLabel?: string;
  nextActionLabel?: string;
  hideSaveAndExit?: boolean;
}

export const CreateExperienceInvites = ({
  experienceId,
  experience,
  onInvitesChange,
  onNext,
  onSaveAndExit,
  onPreview,
  cancelActionLabel = 'Cancel',
  saveAndExitActionLabel = 'Save & Exit',
  nextActionLabel = 'Next',
  hideSaveAndExit = false,
}: CreateExperienceInvitesProps) => {
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
  const [searchUsers, setSearchUsers] = useState<any[]>([]);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);

  const [invitedCommunities, setInvitedCommunities] = useState<Community[]>([]);

  // Search hook with mutation-based API call
  const { mutateAsync: searchUsersAsync } = useSearchUsersDebounced();

  // Debounced search implementation
  useEffect(() => {
    const debounceTimer = setTimeout(async () => {
      const normalizedQuery = memberSearchQuery.trim();

      if (normalizedQuery.length === 0) {
        setSearchUsers([]);
        setIsSearchingUsers(false);
        return;
      }

      try {
        setIsSearchingUsers(true);
        const response = await searchUsersAsync(normalizedQuery);
        setSearchUsers(response?.data?.results || []);
      } catch (error: any) {
        console.error('[invites] User search error:', error);
        setSearchUsers([]);
      } finally {
        setIsSearchingUsers(false);
      }
    }, 500); // 500ms debounce delay

    return () => clearTimeout(debounceTimer);
  }, [memberSearchQuery, searchUsersAsync]);

  useEffect(() => {
    setInvitedMembers(initialInvitedMembers);
  }, [initialInvitedMembers]);

  useEffect(() => {
    onInvitesChange?.(invitedMembers, invitedCommunities);
  }, [invitedMembers, invitedCommunities, onInvitesChange]);

  const { pendingAction, runAction } = usePendingAction<'exit'>();

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
          googleMapPlaceId: (experience as any).googleMapPlaceId || 'ChIJkYb7L8EXLxgRWogSMeTPg8M',
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
    const normalizedQuery = memberSearchQuery.trim();
    if (!normalizedQuery) {
      return [];
    }

    return searchUsers
      ?.map((user: any) => {
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
  }, [searchUsers, invitedMembers, memberSearchQuery]);

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

        <div className="mt-8 flex items-center gap-2 lg:gap-3">
          <Button
            variant="destructive"
            type="button"
            className="bg-white p-0 text-sm text-red-500 hover:bg-white hover:text-red-600"
          >
            {cancelActionLabel}
          </Button>

          <div className="flex-1" />
          <div className="flex items-center gap-2 lg:gap-3">
            {!hideSaveAndExit && (
              <Button
                type="button"
                variant="outline-primary"
                onClick={() => runAction('exit', onSaveAndExit)}
                disabled={pendingAction === 'exit'}
                className="px-6 text-xs font-semibold"
              >
                {pendingAction === 'exit' && (
                  <IconComponent iconName="Loading03Icon" size={16} className="animate-spin" />
                )}
                {saveAndExitActionLabel}
              </Button>
            )}
            <Button
              type="button"
              onClick={onPreview}
              variant="outline"
              className="text-xs font-medium lg:hidden"
            >
              Preview
            </Button>
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
};
