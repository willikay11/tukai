import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createBucketList,
  fetchMyBucketLists,
  fetchSharedBucketLists,
  joinBucketList,
} from '@/services/bucket-list';
import { CreateBucketListPayload } from '@/types/bucket-list';

export const useMyBucketLists = (enabled: boolean = true) =>
  useQuery({
    queryKey: ['bucket-lists', 'mine'],
    queryFn: () => fetchMyBucketLists(),
    enabled,
  });

export const useSharedBucketLists = (enabled: boolean = true) =>
  useQuery({
    queryKey: ['bucket-lists', 'shared'],
    queryFn: () => fetchSharedBucketLists(),
    enabled,
  });

export const useCreateBucketList = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateBucketListPayload) => createBucketList(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bucket-lists', 'mine'] });
    },
  });
};

export const useJoinBucketList = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (bucketListId: string) => joinBucketList(bucketListId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bucket-lists', 'shared'] });
    },
  });
};
