import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  addBucketListItem,
  createBucketList,
  deleteBucketList,
  fetchBucketList,
  fetchMyBucketLists,
  joinBucketList,
  removeBucketListItem,
  reorderBucketListItems,
  updateBucketList,
} from '@/services/bucket-list';
import { AddBucketListItemPayload, BucketList, CreateBucketListPayload } from '@/types/bucket-list';

/**
 * Every list the reader can see — the ones they own and the ones they were
 * invited onto. The API returns them together; `isMember` is what tells the two
 * apart, so the split is made here rather than in a second request.
 */
export const useMyBucketLists = (enabled: boolean = true) =>
  useQuery({
    queryKey: ['bucket-lists', 'mine'],
    queryFn: () => fetchMyBucketLists(),
    enabled,
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
 * are not the only thing that went stale — every card showing that experience
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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bucket-lists'] }),
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
