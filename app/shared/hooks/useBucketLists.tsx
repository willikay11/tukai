import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  acceptBucketListInvite,
  addBucketListItem,
  createBucketList,
  declineBucketListInvite,
  deleteBucketList,
  fetchBucketList,
  fetchBucketListMembers,
  fetchFollowingBucketLists,
  fetchMyBucketListMembership,
  fetchMyBucketLists,
  fetchPublicBucketLists,
  inviteBucketListMember,
  joinBucketList,
  joinPublicBucketList,
  leaveBucketList,
  removeBucketListItem,
  removeBucketListMember,
  reorderBucketListItems,
  updateBucketList,
} from '@/services/bucket-list';
import { AddBucketListItemPayload, BucketList, CreateBucketListPayload } from '@/types/bucket-list';

/**
 * Every list the reader can see - the ones they own and the ones they were
 * invited onto. The API returns them together; `isMember` is what tells the two
 * apart, so the split is made here rather than in a second request.
 */
export const useMyBucketLists = (enabled: boolean = true) =>
  useQuery({
    queryKey: ['bucket-lists', 'mine'],
    queryFn: () => fetchMyBucketLists(),
    enabled,
  });

/**
 * Every public list, for the Discover section. Needs no sign-in, so it is
 * asked for whether or not there is a session.
 */
export const usePublicBucketLists = (enabled: boolean = true, pageSize = 16) =>
  useQuery({
    queryKey: ['bucket-lists', 'public', pageSize],
    queryFn: () => fetchPublicBucketLists(1, pageSize),
    enabled,
    staleTime: 5 * 60 * 1000,
  });

/** One list, with its items. */
export const useBucketList = (bucketListId: string, enabled: boolean = true) =>
  useQuery({
    queryKey: ['bucket-list', bucketListId],
    queryFn: () => fetchBucketList(bucketListId),
    enabled: enabled && Boolean(bucketListId),
  });

export const useCreateBucketList = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateBucketListPayload) => createBucketList(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bucket-lists'] }),
  });
};

export const useUpdateBucketList = (bucketListId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Partial<CreateBucketListPayload>) =>
      updateBucketList(bucketListId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bucket-list', bucketListId] });
      queryClient.invalidateQueries({ queryKey: ['bucket-lists'] });
    },
  });
};

export const useDeleteBucketList = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bucketListId: string) => deleteBucketList(bucketListId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bucket-lists'] }),
  });
};

/**
 * A saved item is a bookmark that also belongs to a list, so saving one flips
 * `is_bookmarked` on the experience or place it points at. The lists holding it
 * are not the only thing that went stale - every card showing that experience
 * or place is now wrong until its query is re-read.
 */
const invalidateSaved = (queryClient: ReturnType<typeof useQueryClient>, bucketListId: string) => {
  queryClient.invalidateQueries({ queryKey: ['bucket-list', bucketListId] });
  queryClient.invalidateQueries({ queryKey: ['bucket-lists'] });
  // The cards, so the basket is filled in on the way back to them
  queryClient.invalidateQueries({ queryKey: ['experiences'] });
  queryClient.invalidateQueries({ queryKey: ['experience'] });
  queryClient.invalidateQueries({ queryKey: ['places'] });
  queryClient.invalidateQueries({ queryKey: ['place'] });
};

export const useAddBucketListItem = (bucketListId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AddBucketListItemPayload) => addBucketListItem(bucketListId, payload),
    onSuccess: () => invalidateSaved(queryClient, bucketListId),
  });
};

export const useRemoveBucketListItem = (bucketListId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId: string) => removeBucketListItem(bucketListId, itemId),
    onSuccess: () => invalidateSaved(queryClient, bucketListId),
  });
};

/** Takes up a share link. The token is what identifies the list, not its id. */
export const useJoinBucketList = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (shareToken: string) => joinBucketList(shareToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bucket-lists'] });
      // Every `['bucket-list', id]` detail query, not just the list page -
      // the drawer a reader joined from reads the same cache and would
      // otherwise keep showing its own "Join" button after joining
      queryClient.invalidateQueries({ queryKey: ['bucket-list'] });
    },
  });
};

/** Steps off a shared list. The list stays; the reader is no longer a member. */
export const useLeaveBucketList = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bucketListId: string) => leaveBucketList(bucketListId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bucket-lists'] });
      queryClient.invalidateQueries({ queryKey: ['bucket-list'] });
    },
  });
};

/** True where the reader is on the list but does not own it. */
export const isSharedWithMe = (bucketList: BucketList, userId?: string | null): boolean =>
  Boolean(bucketList.owner?.id && userId && bucketList.owner.id !== userId);

/** Saves the order items appear in. The whole sequence goes in one request. */
export const useReorderBucketListItems = (bucketListId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (order: string[]) => reorderBucketListItems(bucketListId, order),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bucket-list', bucketListId] });
    },
  });
};

/** The lists the reader has joined and does not own - the Following tab. */
export const useFollowingBucketLists = (enabled: boolean = true) =>
  useQuery({
    queryKey: ['bucket-lists', 'following'],
    queryFn: () => fetchFollowingBucketLists(),
    enabled,
  });

/**
 * Every public list, a page at a time - the Discover tab, where Show more adds
 * the next page rather than asking again for everything already on screen.
 */
export const useInfinitePublicBucketLists = (pageSize = 12) =>
  useInfiniteQuery({
    queryKey: ['bucket-lists', 'public', 'pages', pageSize],
    queryFn: ({ pageParam }) => fetchPublicBucketLists(pageParam, pageSize),
    initialPageParam: 1,
    getNextPageParam: (lastPage, pages) => (lastPage?.data?.next ? pages.length + 1 : undefined),
    staleTime: 5 * 60 * 1000,
  });

/** Joins a public list by its id, as the drawer's Join button does. */
export const useJoinPublicBucketList = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bucketListId: string) => joinPublicBucketList(bucketListId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bucket-lists'] });
      queryClient.invalidateQueries({ queryKey: ['bucket-list'] });
    },
  });
};

/** Everyone on a list, invites included. Only the owner may ask. */
export const useBucketListMembers = (bucketListId: string, enabled: boolean = true) =>
  useQuery({
    queryKey: ['bucket-list', bucketListId, 'members'],
    queryFn: () => fetchBucketListMembers(bucketListId),
    enabled: enabled && Boolean(bucketListId),
  });

/**
 * The reader's own place on a list, if any - a 404 just means they have none,
 * so it is not retried.
 */
export const useMyBucketListMembership = (bucketListId: string, enabled: boolean = true) =>
  useQuery({
    queryKey: ['bucket-list', bucketListId, 'membership'],
    queryFn: () => fetchMyBucketListMembership(bucketListId),
    enabled: enabled && Boolean(bucketListId),
    retry: false,
  });

export type BucketListInvitee = { userId?: string; email?: string };

/**
 * Sends every invite picked at once. The API takes one person per request, so
 * they go out together and the mutation settles when the last one does.
 */
export const useInviteBucketListMembers = (bucketListId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (invitees: BucketListInvitee[]) =>
      Promise.all(invitees.map((invitee) => inviteBucketListMember(bucketListId, invitee))),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bucket-list', bucketListId] }),
  });
};

/** Takes a member off, or cancels an invite they have not answered. */
export const useRemoveBucketListMember = (bucketListId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => removeBucketListMember(bucketListId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bucket-list', bucketListId] });
      queryClient.invalidateQueries({ queryKey: ['bucket-lists'] });
    },
  });
};

export const useAcceptBucketListInvite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bucketListId: string) => acceptBucketListInvite(bucketListId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bucket-lists'] });
      queryClient.invalidateQueries({ queryKey: ['bucket-list'] });
    },
  });
};

export const useDeclineBucketListInvite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bucketListId: string) => declineBucketListInvite(bucketListId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bucket-list'] }),
  });
};
