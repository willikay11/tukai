import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  bookmarkPlace,
  createPlaceReview,
  createPlaceReviewComment,
  deletePlaceReview,
  deletePlaceReviewImage,
  fetchGoogleMapsAutocomplete,
  fetchGoogleMapsPlaceGeocode,
  fetchPlaceCategories,
  fetchPlaceReviewComments,
  fetchPlaceReviews,
  fetchPlaces,
  likePlaceReview,
  likePlaceReviewComment,
  updatePlaceReview,
  uploadPlaceReviewImages,
} from '@/services/place';
import { PlaceCategoryParams } from '@/types/networkParam';

export const usePlaces = ({
  categoryId,
  page,
  enabled,
  lat,
  lng,
  search,
}: {
  categoryId?: string | string[];
  page: number;
  enabled: boolean;
  lat?: number;
  lng?: number;
  search?: string;
}) => {
  return useQuery({
    queryKey: ['places', { categoryId, page, lat, lng, search }],
    queryFn: async () => await fetchPlaces(page, 12, categoryId, search, lat, lng),
    enabled,
  });
};

export const usePlaceCategories = (
  params: PlaceCategoryParams = { pageSize: 100 },
  enabled: boolean = false,
) => {
  return useQuery({
    queryKey: ['placeCategories', params],
    queryFn: async () => await fetchPlaceCategories(params),
    staleTime: 3600 * 1000, // 3600 seconds (1 hour)
    gcTime: 3600 * 1000, // Keep in cache for 1 hour
    enabled,
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

export const useGoogleMapsAutocomplete = (input: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['googleMapsAutocomplete', input],
    queryFn: async () => await fetchGoogleMapsAutocomplete(input),
    enabled: enabled && input.length > 0,
    staleTime: 60000, // 60 seconds
  });
};

// A place id resolves to the same coordinates forever, so this is cached hard
export const useGoogleMapsPlaceGeocode = (placeId: string | null, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['googleMapsPlaceGeocode', placeId],
    queryFn: async () => await fetchGoogleMapsPlaceGeocode(placeId!),
    enabled: enabled && Boolean(placeId),
    staleTime: Infinity,
  });
};
