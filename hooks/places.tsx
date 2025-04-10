import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchPlaces,
  fetchPlaceCategories,
  fetchPlaceReviews,
  fetchPlaceReviewComments,
  createPlaceReviewComment,
  likePlaceReviewComment,
  likePlaceReview,
  unbookmarkPlace,
  bookmarkPlace,
  createPlaceReview,
  uploadPlaceReviewImages,
  deletePlaceReview,
  updatePlaceReview,
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

export const useLikePlaceReviewComment = (placeId: string, reviewId: string, commentId: string) => {
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

export const useLikePlaceReview = (placeId: string, reviewId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () =>
      await likePlaceReview(placeId, reviewId, {
        place_id: placeId,
        review_id: reviewId,
      }),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['placeReviews', placeId] });
    },
  });
};

export const useBookmarkPlace = (placeId: string, userId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => await bookmarkPlace(placeId, { user_id: userId }),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['place', placeId] });
    },
  });
};

export const useUnbookmarkPlace = (placeId: string, userId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => await unbookmarkPlace(placeId, { user_id: userId }),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['place', placeId] });
    },
  });
};

export const useCreatePlaceReview = (placeId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => await createPlaceReview(placeId, data),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['placeReviews', placeId] });
    },
  });
};

export const useUpdatePlaceReview = (placeId: string, reviewId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => await updatePlaceReview(placeId, reviewId, data),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['placeReviews', placeId] });
    },
  });
};

export const useUploadPlaceReviewImages = (placeId: string, reviewId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      return await uploadPlaceReviewImages(placeId, reviewId, data);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['placeReviews', placeId] });
    },
  });
};

export const useDeletePlaceReview = (placeId: string, reviewId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => await deletePlaceReview(placeId, reviewId),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['placeReviews', placeId] });
    },
  });
};
