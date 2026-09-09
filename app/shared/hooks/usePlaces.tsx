import { useSession } from 'next-auth/react';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useGetCommunities } from '@/app/shared/hooks/useCommunities';
import {
  activateReservationProfile,
  bookmarkPlace,
  cancelPlaceBookingRequest,
  claimPlaceOwnership,
  createAvailabilityRule,
  createPlace,
  createPlaceBookingRequest,
  createPlaceProperty,
  createPlaceReview,
  createPlaceReviewComment,
  createPlaceSocialLink,
  createReservationProfile,
  deleteAvailabilityRule,
  deletePlacePhoto,
  deletePlaceProperty,
  deletePlaceReview,
  deletePlaceReviewImage,
  deletePlaceSocialLink,
  fetchFollowing,
  fetchGoogleMapsAutocomplete,
  fetchGoogleMapsPlaceGeocode,
  fetchMyPlaces,
  fetchPlace,
  fetchPlaceAvailability,
  fetchPlaceBookingRequests,
  fetchPlaceCategories,
  fetchPlaceOwnership,
  fetchPlaceReservationProfiles,
  fetchPlaceReviewComments,
  fetchPlaceReviews,
  fetchPlaces,
  likePlaceReview,
  likePlaceReviewComment,
  updatePlace,
  updatePlaceProperty,
  updatePlaceReview,
  updatePlaceSocialLink,
  updateReservationProfile,
  uploadPlacePhoto,
  uploadPlaceReviewImages,
} from '@/services/place';
import { Community } from '@/types/community';
import { PlaceCategoryParams } from '@/types/networkParam';
import { PlaceEditDraft } from '@/types/placeEdit';
import { ReservationSettingsDraft } from '@/types/placeReservation';
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

/**
 * Who owns this place, if anyone. `data` is null for an unclaimed place — the
 * API's 404 — which is what tells a claim prompt from a booking one.
 *
 * The endpoint is authenticated, so callers gate this on a session rather than
 * firing a 401 on every place a signed-out reader opens. A failed request
 * leaves `data` undefined, which is NOT the same as "nobody owns it".
 */
export const usePlaceOwnership = (placeId: string, enabled = true) =>
  useQuery({
    queryKey: ['placeOwnership', placeId],
    queryFn: async () => await fetchPlaceOwnership(placeId),
    enabled: enabled && Boolean(placeId),
    staleTime: 5 * 60 * 1000,
  });

/**
 * Whether the reader manages this place.
 *
 * Ownership is held by a community, not a person, so this is true when the
 * claiming community is one the reader created. It stays false while either
 * question is unanswered — an owner-only strip must never flash for a visitor.
 */
export const usePlaceManager = (placeId: string) => {
  const { data: session } = useSession();
  // The session types it as possibly null; the hooks below take undefined
  const userId = session?.user?.id ?? undefined;

  const { data: ownership, isLoading: isLoadingOwnership } = usePlaceOwnership(
    placeId,
    Boolean(userId),
  );
  const owningCommunityId: string | undefined = ownership?.data?.community;

  const { data: communitiesResponse, isLoading: isLoadingCommunities } = useGetCommunities({
    page: 1,
    enabled: Boolean(userId && owningCommunityId),
    createdBy: userId,
  });
  const communities: Community[] = communitiesResponse?.data?.results ?? [];

  return {
    isManager: Boolean(
      owningCommunityId && communities.some((community) => community.id === owningCommunityId),
    ),
    isLoading: isLoadingOwnership || isLoadingCommunities,
    owningCommunityId,
  };
};

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

/**
 * Saves every change the edit screen collected, in one call.
 *
 * The place, its photos, its properties and its social links are four separate
 * endpoints, so the draft is diffed against what was loaded and only what
 * actually moved is sent. Photos are ordered deliberately: removals first, so a
 * place at its photo limit can still take replacements.
 *
 * The whole thing is one mutation because it is one button. A partial failure
 * surfaces as a failure — the caller re-reads the place either way.
 */
export const useSavePlaceEdits = (placeId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (draft: PlaceEditDraft) => {
      const { about, photos, properties, socialLinks } = draft;

      if (about) await updatePlace(placeId, about);

      for (const photoId of photos?.removedIds ?? []) {
        await deletePlacePhoto(placeId, photoId);
      }

      // Only the first photo of a place with none left can claim the cover;
      // the API sets no cover flag on its own
      const addedPhotos = photos?.added ?? [];
      for (let index = 0; index < addedPhotos.length; index += 1) {
        const added = addedPhotos[index];
        await uploadPlacePhoto(placeId, {
          photo: added.file,
          isCover: added.isCover,
          order: added.order ?? index,
        });
      }

      for (const propertyId of properties?.removedIds ?? []) {
        await deletePlaceProperty(placeId, propertyId);
      }
      for (const property of properties?.updated ?? []) {
        await updatePlaceProperty(placeId, property.id, property.data);
      }
      for (const property of properties?.added ?? []) {
        await createPlaceProperty(placeId, property);
      }

      for (const linkId of socialLinks?.removedIds ?? []) {
        await deletePlaceSocialLink(placeId, linkId);
      }
      for (const link of socialLinks?.updated ?? []) {
        await updatePlaceSocialLink(placeId, link.id, link.data);
      }
      for (const link of socialLinks?.added ?? []) {
        await createPlaceSocialLink(placeId, link);
      }
    },
    onSuccess: () => {
      // The detail endpoint carries photos, properties and links together, so
      // the public page and the form both re-read from one invalidation
      queryClient.invalidateQueries({ queryKey: ['place', placeId] });
      queryClient.invalidateQueries({ queryKey: ['places'] });
      queryClient.invalidateQueries({ queryKey: ['myPlaces'] });
    },
  });
};

/**
 * Saves a place's reservation settings, creating the profile if there is none.
 *
 * Three endpoints, in an order that matters: the profile has to exist before
 * its weekly hours can hang off it, and it takes no bookings until it is
 * activated. Hours are replaced rather than edited — the API creates and
 * deletes rules but does not update them — so a day whose times changed is
 * removed and written again.
 */
export const useSaveReservationSettings = (placeId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (draft: ReservationSettingsDraft) => {
      const { profileId, profile, rules, existingRules, isActive } = draft;

      const saved = profileId
        ? await updateReservationProfile(placeId, profileId, profile)
        : await createReservationProfile(placeId, profile);

      const id: string | undefined = profileId ?? saved.data?.id;
      if (!id) throw new Error('The reservation profile could not be created');

      // Every rule whose day is gone, or whose times moved, is rewritten
      const keptDays = new Set(rules.map((rule) => rule.dayOfWeek));
      for (const existing of existingRules) {
        const replacement = rules.find((rule) => rule.dayOfWeek === existing.dayOfWeek);
        const isUnchanged =
          replacement &&
          replacement.openTime === existing.openTime &&
          replacement.closeTime === existing.closeTime &&
          (replacement.slotIntervalMinutes ?? null) === (existing.slotIntervalMinutes ?? null);

        if (!keptDays.has(existing.dayOfWeek) || !isUnchanged) {
          await deleteAvailabilityRule(placeId, id, existing.id);
        }
      }

      for (const rule of rules) {
        const existing = existingRules.find((entry) => entry.dayOfWeek === rule.dayOfWeek);
        const isUnchanged =
          existing &&
          existing.openTime === rule.openTime &&
          existing.closeTime === rule.closeTime &&
          (existing.slotIntervalMinutes ?? null) === (rule.slotIntervalMinutes ?? null);

        if (!isUnchanged) await createAvailabilityRule(placeId, id, rule);
      }

      // A draft profile is invisible to diners, so saving settings opens it
      if (!isActive) await activateReservationProfile(placeId, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['placeReservationProfiles', placeId] });
      queryClient.invalidateQueries({ queryKey: ['placeAvailability', placeId] });
    },
  });
};
