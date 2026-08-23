import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  MomentsQueryParams,
  addMomentComment,
  fetchFlagReasons,
  fetchMomentComments,
  fetchMoments,
  flagComment,
  flagMoment,
  toggleCommentLike,
  toggleMomentLike,
} from '@/services/moments';

export const useMoments = (params: MomentsQueryParams = {}, enabled: boolean = true) =>
  useQuery({
    // Every param that changes the request belongs in the key — without
    // `community`, a community-filtered query serves the whole feed from cache
    queryKey: ['moments', params.page, params.page_size, params.community],
    queryFn: async () => await fetchMoments(params),
    enabled,
  });

const PAGE_SIZE = 20;

// `next` is a full URL; its page number is all we need to ask for the next page
const nextPageFrom = (next: string | null | undefined, currentPage: number): number | undefined =>
  next ? currentPage + 1 : undefined;

// Kept separate from useMoments, which the Discover row consumes as a plain
// query — switching that one to an infinite query would change its shape.
export const useInfiniteMoments = (pageSize: number = PAGE_SIZE) =>
  useInfiniteQuery({
    queryKey: ['moments', 'infinite', pageSize],
    queryFn: async ({ pageParam }) => await fetchMoments({ page: pageParam, page_size: pageSize }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => nextPageFrom(lastPage?.data?.next, allPages.length),
  });

export const useMomentComments = (momentId: string | null, pageSize: number = PAGE_SIZE) =>
  useInfiniteQuery({
    queryKey: ['moment-comments', momentId, pageSize],
    queryFn: async ({ pageParam }) =>
      await fetchMomentComments(momentId!, { page: pageParam, page_size: pageSize }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => nextPageFrom(lastPage?.data?.next, allPages.length),
    enabled: Boolean(momentId),
  });

export const useAddComment = (momentId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (content: string) => await addMomentComment(momentId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moment-comments', momentId] });
      queryClient.invalidateQueries({ queryKey: ['moments'] });
    },
  });
};

export const useToggleMomentLike = () =>
  useMutation({
    mutationFn: async (momentId: string) => await toggleMomentLike(momentId),
  });

export const useToggleCommentLike = (momentId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (commentId: string) => await toggleCommentLike(momentId, commentId),
    // Re-read the list so total_likes comes from the server rather than a
    // locally accumulated guess
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['moment-comments', momentId] });
    },
  });
};

export const useFlagReasons = (enabled: boolean = false) =>
  useQuery({
    queryKey: ['moment-flag-reasons'],
    queryFn: async () => await fetchFlagReasons(),
    staleTime: 3600 * 1000,
    enabled,
  });

export const useFlagMoment = () =>
  useMutation({
    mutationFn: async ({ momentId, reasonId }: { momentId: string; reasonId: string }) =>
      await flagMoment(momentId, reasonId),
  });

export const useFlagComment = (momentId: string) =>
  useMutation({
    mutationFn: async ({ commentId, reasonId }: { commentId: string; reasonId: string }) =>
      await flagComment(momentId, commentId, reasonId),
  });
