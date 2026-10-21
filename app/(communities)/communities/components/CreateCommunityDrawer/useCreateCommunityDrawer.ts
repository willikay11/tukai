import { useMemo, useState } from 'react';

import { useRouter } from 'next/navigation';

import { useGetInterestCategories, useGetUsers } from '@/app/shared/hooks/useAuth';
import { useCreateCommunity, useGetCommunities } from '@/app/shared/hooks/useCommunities';
import { toast } from '@/app/shared/hooks/useToast';
import { useLocation } from '@/context/LocationContext';
import { Community } from '@/types/community';
import { communityPath } from '@/utils/detail-paths';

export type CommunityVisibility = 'public' | 'private';

export interface DraftPhoto {
  id: string;
  file: File;
  url: string;
}

export interface InvitedPerson {
  id: string;
  name: string;
  email?: string;
  image?: string;
}

export type CreateCommunityDrawerView = 'form' | 'preview';

const MAX_PHOTOS = 6;

/**
 * Everything the create-community drawer needs: the draft itself, the people
 * and category search it offers, and the submit. Nothing resets when the
 * drawer is merely closed (the X) - only Cancel and a successful create start
 * a fresh draft, per the canvas's "Close keeps the draft for next time."
 */
export const useCreateCommunityDrawer = (onOpenChange: (open: boolean) => void) => {
  const router = useRouter();
  const location = useLocation();

  const [view, setView] = useState<CreateCommunityDrawerView>('form');
  const [photos, setPhotos] = useState<DraftPhoto[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState<CommunityVisibility>('public');
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [invitedPeople, setInvitedPeople] = useState<InvitedPerson[]>([]);
  const [invitedCommunityIds, setInvitedCommunityIds] = useState<string[]>([]);
  const [peopleQuery, setPeopleQuery] = useState('');

  const { data: categories = [] } = useGetInterestCategories();

  const { data: myCommunitiesResponse, isFetching: isFetchingMyCommunities } = useGetCommunities({
    page: 1,
    enabled: true,
    following: true,
  });

  const myCommunities: Community[] = useMemo(
    () => myCommunitiesResponse?.data?.results ?? [],
    [myCommunitiesResponse],
  );

  const normalizedPeopleQuery = peopleQuery.trim();
  const { data: users = [], isFetching: isSearchingPeople } = useGetUsers(
    1,
    10,
    normalizedPeopleQuery.length > 0 ? normalizedPeopleQuery : undefined,
  );

  const peopleResults: InvitedPerson[] = useMemo(() => {
    if (!normalizedPeopleQuery) return [];

    return (users as any[])
      .map((user) => ({
        id: user.id,
        name: user.displayName || `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || user.email,
        email: user.email,
        image: user.picture,
      }))
      .filter((person) => !invitedPeople.some((invited) => invited.id === person.id));
  }, [users, normalizedPeopleQuery, invitedPeople]);

  const { mutate: createCommunity, isPending: isCreating } = useCreateCommunity();

  const resetDraft = () => {
    setPhotos([]);
    setName('');
    setDescription('');
    setVisibility('public');
    setCategoryIds([]);
    setInvitedPeople([]);
    setInvitedCommunityIds([]);
    setPeopleQuery('');
    setView('form');
  };

  const canSubmit = name.trim().length > 0 && !isCreating;

  const addPhotos = (files: File[]) => {
    if (files.length === 0) return;

    const room = MAX_PHOTOS - photos.length;

    if (room <= 0) {
      toast({ description: 'You can add up to 6 photos.' });
      return;
    }

    const accepted = files.slice(0, room);

    if (files.length > accepted.length) {
      toast({
        description: `You can add up to 6 photos. The first ${accepted.length} were added.`,
      });
    }

    const next = accepted.map((file) => ({
      id: `photo-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      file,
      url: URL.createObjectURL(file),
    }));

    setPhotos((previous) => [...previous, ...next]);
  };

  const removePhoto = (id: string) => {
    setPhotos((previous) => {
      const target = previous.find((photo) => photo.id === id);
      if (target) URL.revokeObjectURL(target.url);
      return previous.filter((photo) => photo.id !== id);
    });
  };

  const movePhoto = (id: string, direction: -1 | 1) => {
    setPhotos((previous) => {
      const index = previous.findIndex((photo) => photo.id === id);
      const target = index + direction;
      if (index === -1 || target < 0 || target >= previous.length) return previous;

      const next = [...previous];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const reorderPhotos = (fromIndex: number, toIndex: number) => {
    setPhotos((previous) => {
      if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) return previous;
      const next = [...previous];
      const [moved] = next.splice(fromIndex, 1);
      if (!moved) return previous;
      next.splice(toIndex, 0, moved);
      return next;
    });
  };

  const toggleCategory = (id: string) => {
    setCategoryIds((previous) =>
      previous.includes(id) ? previous.filter((item) => item !== id) : [...previous, id],
    );
  };

  const toggleMyCommunity = (id: string) => {
    setInvitedCommunityIds((previous) =>
      previous.includes(id) ? previous.filter((item) => item !== id) : [...previous, id],
    );
  };

  const addInvitedPerson = (person: InvitedPerson) => {
    setInvitedPeople((previous) =>
      previous.some((invited) => invited.id === person.id) ? previous : [...previous, person],
    );
  };

  const removeInvitedPerson = (id: string) => {
    setInvitedPeople((previous) => previous.filter((person) => person.id !== id));
  };

  const handleCancel = () => {
    resetDraft();
    onOpenChange(false);
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleSubmit = () => {
    const title = name.trim();
    if (!title) return;

    const memberIds = invitedPeople.filter((person) => !person.id.startsWith('email-')).map((p) => p.id);
    const emails = invitedPeople.filter((person) => person.id.startsWith('email-')).map((p) => p.email!);

    createCommunity(
      {
        title,
        description: description.trim(),
        categoriesIds: categoryIds,
        isPublic: visibility === 'public',
        googleMapPlaceId: location.placeId ?? '',
        newPhotos: photos.map((photo) => photo.file),
        invitedMemberIds: memberIds,
        invitedCommunityIds,
        invitedEmails: emails,
      },
      {
        onSuccess: (response: any) => {
          const invitedCount = memberIds.length + emails.length;
          const invitesNote =
            invitedCount === 1
              ? ' Invites are on their way to 1 person.'
              : invitedCount > 1
                ? ` Invites are on their way to ${invitedCount} people.`
                : '';

          toast({ title: `${title} is ready.${invitesNote}` });

          const createdId = response?.data?.id;
          const createdSlug = response?.data?.slug;

          resetDraft();
          onOpenChange(false);

          if (createdId) {
            router.push(communityPath({ id: createdId, slug: createdSlug }));
          }
        },
        onError: (error: Error) => {
          toast({
            title: 'Could not create this community',
            description: error.message,
            variant: 'destructive',
          });
        },
      },
    );
  };

  return {
    view,
    setView,
    photos,
    name,
    setName,
    description,
    setDescription,
    visibility,
    setVisibility,
    categoryIds,
    categories,
    invitedPeople,
    invitedCommunityIds,
    myCommunities,
    isFetchingMyCommunities,
    peopleQuery,
    setPeopleQuery,
    peopleResults,
    isSearchingPeople,
    isCreating,
    canSubmit,
    location,
    handlers: {
      addPhotos,
      removePhoto,
      movePhoto,
      reorderPhotos,
      toggleCategory,
      toggleMyCommunity,
      addInvitedPerson,
      removeInvitedPerson,
      handleCancel,
      handleClose,
      handleSubmit,
    },
  };
};
