import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchPlaces,
  fetchPlaceCategories,
  fetchPlaceReviews,
  fetchPlaceReviewComments,
  createPlaceReviewComment,
  likePlaceReviewComment,
  likePlaceReview,
  bookmarkPlace,
  createPlaceReview,
  uploadPlaceReviewImages,
  deletePlaceReview,
  updatePlaceReview,
  deletePlaceReviewImage,
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
    queryFn: async () => await fetchPlaces(page, 12, categoryId),
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

export const useLikePlaceReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ placeId, reviewId }: { placeId: string; reviewId: string }) =>
      await likePlaceReview(placeId, reviewId, {
        place_id: placeId,
        review_id: reviewId,
      }),
    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({ queryKey: ['placeReviews', variables.placeId] });
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

export const useCreatePlaceReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ placeId, data }: { placeId: string; data: any }) =>
      await createPlaceReview(placeId, data),
    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({ queryKey: ['placeReviews', variables.placeId] });
    },
  });
};

export const useUpdatePlaceReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      placeId,
      reviewId,
      data,
    }: {
      placeId: string;
      reviewId: string;
      data: any;
    }) => await updatePlaceReview(placeId, reviewId, data),
    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({ queryKey: ['placeReviews', variables.placeId] });
    },
  });
};

export const useUploadPlaceReviewImages = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      placeId,
      reviewId,
      data,
    }: {
      placeId: string;
      reviewId: string;
      data: any;
    }) => {
      return await uploadPlaceReviewImages(placeId, reviewId, data);
    },
    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({ queryKey: ['placeReviews', variables.placeId] });
    },
  });
};

export const useDeletePlaceReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ placeId, reviewId }: { placeId: string; reviewId: string }) =>
      await deletePlaceReview(placeId, reviewId),
    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({ queryKey: ['placeReviews', variables.placeId] });
    },
  });
};

export const useDeletePlaceReviewImage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      placeId,
      reviewId,
      imageId,
    }: {
      placeId: string;
      reviewId: string;
      imageId: string;
    }) => await deletePlaceReviewImage(placeId, reviewId, imageId),
    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({ queryKey: ['placeReviews', variables.placeId] });
    },
  });
};
