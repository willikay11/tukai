import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  bookmarkPlace,
  cancelPlaceBookingRequest,
  claimPlaceOwnership,
  createPlace,
  createPlaceBookingRequest,
  createPlaceReview,
  createPlaceReviewComment,
  deletePlaceReview,
  deletePlaceReviewImage,
  fetchFollowing,
  fetchGoogleMapsAutocomplete,
  fetchGoogleMapsPlaceGeocode,
  fetchMyPlaces,
  fetchPlace,
  fetchPlaceAvailability,
  fetchPlaceBookingRequests,
  fetchPlaceCategories,
  fetchPlaceReservationProfiles,
  fetchPlaceReviewComments,
  fetchPlaceReviews,
  fetchPlaces,
  likePlaceReview,
  likePlaceReviewComment,
  updatePlaceReview,
  uploadPlaceReviewImages,
} from '@/services/place';
import { PlaceCategoryParams } from '@/types/networkParam';
import { CreatePlaceBookingRequest } from '@/types/placeReservation';

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

/** The places this user owns, for Creator Studio. */
export const useMyPlaces = (enabled: boolean = true) =>
  useQuery({
    queryKey: ['myPlaces'],
    queryFn: async () => await fetchMyPlaces(),
    enabled,
  });

// A single place, used where only its id is known — e.g. resolving the
// coordinates of a Tukai place picked during experience creation
export const usePlace = (id: string | null, enabled: boolean = true) =>
  useQuery({
    queryKey: ['place', id],
    queryFn: async () => await fetchPlace(id!),
    enabled: enabled && Boolean(id),
    staleTime: Infinity,
  });

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

// ─── Place reservations ────────────────────────────────────────────────────

/** The place's bookability profiles. Public — anyone may list them. */
export const usePlaceReservationProfiles = (placeId: string, enabled = true) =>
  useQuery({
    queryKey: ['placeReservationProfiles', placeId],
    queryFn: async () => await fetchPlaceReservationProfiles(placeId),
    enabled: enabled && Boolean(placeId),
    staleTime: 5 * 60 * 1000,
  });

/** Weekly hours plus one-off overrides, fetched together — both drive one picker. */
export const usePlaceAvailability = (placeId: string, profileId: string | undefined) =>
  useQuery({
    queryKey: ['placeAvailability', placeId, profileId],
    queryFn: async () => await fetchPlaceAvailability(placeId, profileId!),
    enabled: Boolean(placeId && profileId),
    staleTime: 5 * 60 * 1000,
  });

export const usePlaceBookingRequests = (placeId: string, profileId: string | undefined) =>
  useQuery({
    queryKey: ['placeBookingRequests', placeId, profileId],
    queryFn: async () => await fetchPlaceBookingRequests(placeId, profileId!),
    enabled: Boolean(placeId && profileId),
  });

export const useCreatePlaceBookingRequest = (placeId: string, profileId: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreatePlaceBookingRequest) =>
      await createPlaceBookingRequest(placeId, profileId!, data),
    onSuccess: () => {
      // The new request has to show up under "My Reservations" straight away
      queryClient.invalidateQueries({ queryKey: ['placeBookingRequests', placeId, profileId] });
    },
  });
};

export const useCancelPlaceBookingRequest = (placeId: string, profileId: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (purchaseId: string) => await cancelPlaceBookingRequest(purchaseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['placeBookingRequests', placeId, profileId] });
    },
  });
};

/** People the reader follows, offered as invitees on a reservation. */
export const useFollowing = (userId: string | undefined) =>
  useQuery({
    queryKey: ['following', userId],
    queryFn: async () => await fetchFollowing(userId!),
    enabled: Boolean(userId),
    staleTime: 5 * 60 * 1000,
  });

export const useClaimPlaceOwnership = () => {
  const queryClient = useQueryClient();

  return useMutation({
    // The place travels with the mutation rather than with the hook: a claim on
    // a place that was only just created has no id until submit time
    mutationFn: async ({ placeId, communityId }: { placeId: string; communityId: string }) =>
      await claimPlaceOwnership(placeId, communityId),
    onSuccess: (_data, { placeId }) => {
      // A granted claim is what makes the place bookable, so the panel has to
      // re-read its profiles
      queryClient.invalidateQueries({ queryKey: ['placeReservationProfiles', placeId] });
    },
  });
};

/**
 * Adds a place the reader could not find on Tukai. The claim form runs this
 * first, then claims the place it returns.
 */
export const useCreatePlace = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Parameters<typeof createPlace>[0]) => await createPlace(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['places'] }),
  });
};
