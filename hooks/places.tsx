import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchPlaces,
  fetchPlaceCategories,
  fetchPlaceReviews,
  fetchPlaceReviewComments,
  createPlaceReviewComment,
  likePlaceReviewComment,
} from '@/services/place';

export const usePlaces = ({
  categoryId,
  page,
  enabled,
}: {
  categoryId?: string;
  page: number;
  enabled: boolean;
}) => {
  return useQuery({
    queryKey: ['placeCategories', categoryId, page],
    queryFn: async () => await fetchPlaces(categoryId, page),
    enabled,
  });
};

export const usePlaceCategories = () => {
  return useQuery({
    queryKey: ['placeCategories'],
    queryFn: async () => await fetchPlaceCategories(),
  });
};

export const usePlaceReviews = (id: string) => {
  return useQuery({
    queryKey: ['placeReviews', id],
    queryFn: async () => await fetchPlaceReviews(id),
  });
};

export const usePlaceReviewComments = (placeId: string, reviewId: string, enabled: boolean) => {
  return useQuery({
    queryKey: ['placeReviewComments', placeId, reviewId],
    queryFn: async () => await fetchPlaceReviewComments(placeId, reviewId),
    enabled,
  });
};

export const useCreatePlaceReviewComment = (
  placeId: string,
  reviewId: string,
  data?: { post_id: string; commenter_id: string; content: string },
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => await createPlaceReviewComment(placeId, reviewId, data),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['placeReviewComments', placeId, reviewId] });
    },
  });
};

export const useLikePlaceReviewComment = (
  placeId: string,
  reviewId: string,
  commentId: string,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () =>
      await likePlaceReviewComment(placeId, reviewId, commentId, {
        place_id: placeId,
        review_id: reviewId,
        comment_id: commentId,
      }),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['placeReviewComments', placeId, reviewId] });
    },
  });
};
