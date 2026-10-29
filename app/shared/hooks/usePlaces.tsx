import { useSession } from 'next-auth/react';

import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';

import { fetchTicketPurchases } from '@/services/experience';
import {
  acceptPlaceBookingRequest,
  activateReservationProfile,
  addReservationProfilePhotos,
  admitPlaceBookingRequest,
  bookmarkPlace,
  cancelPlaceBookingRequest,
  claimPlaceOwnership,
  createAvailabilityException,
  createAvailabilityRule,
  createPlace,
  createPlaceBookingRequest,
  createPlaceProperty,
  createPlaceReview,
  createPlaceReviewComment,
  createPlaceSocialLink,
  createReservationProfile,
  declinePlaceBookingRequest,
  deleteAvailabilityException,
  deleteAvailabilityRule,
  deletePlaceOwnership,
  deletePlacePhoto,
  deletePlaceProperty,
  deletePlaceReview,
  deletePlaceReviewImage,
  deletePlaceSocialLink,
  fetchFeaturedPlaces,
  fetchFollowing,
  fetchGoogleMapsAutocomplete,
  fetchGoogleMapsPlaceGeocode,
  fetchMyPlaces,
  fetchPlace,
  fetchPlaceAvailability,
  fetchPlaceBookingRequests,
  fetchPlaceCategories,
  fetchPlaceOwnership,
  fetchPlaceReservationProfile,
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
import { ApiResponse } from '@/types/apiResponse';
import { PlaceCategoryParams } from '@/types/networkParam';
import { Photo } from '@/types/photo';
import { PlaceVerifiedOwner } from '@/types/place';
import { PlaceEditDraft } from '@/types/placeEdit';
import {
  CreatePlaceAvailabilityException,
  CreatePlaceBookingRequest,
  ReservationSettingsDraft,
} from '@/types/placeReservation';
import { placePhotosAsUploads } from '@/utils/place-photo-uploads';

const lendPlacePhotosToProfile = async (
  placeId: string,
  profileId: string,
  placePhotos: Photo[],
) => {
  if (placePhotos.length === 0) return;

  const detail = await fetchPlaceReservationProfile(placeId, profileId);
  if (detail.data?.photos?.length) return;

  const uploads = await placePhotosAsUploads(placePhotos);
  if (uploads.length === 0) return;

  await addReservationProfilePhotos(placeId, profileId, uploads);
};

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

/** The places this user owns, for Control Center. */
export const useMyPlaces = (enabled: boolean = true) =>
  useQuery({
    queryKey: ['myPlaces'],
    queryFn: async () => await fetchMyPlaces(),
    enabled,
  });

// A single place, used where only its id is known - e.g. resolving the
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
 * Who owns this place, if anyone. `data` is null for an unclaimed place - the
 * API's 404 - which is what tells a claim prompt from a booking one.
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

export const usePlaceOwnerships = (placeIds: string[], enabled = true) =>
  useQueries({
    queries: placeIds.map((placeId) => ({
      queryKey: ['placeOwnership', placeId],
      queryFn: async () => await fetchPlaceOwnership(placeId),
      enabled,
      staleTime: 5 * 60 * 1000,
    })),
  });

/** The people who run a place are the owners and admins of the community that holds it. */
export const isVerifiedPlaceOwner = (
  verifiedOwner: PlaceVerifiedOwner | null | undefined,
  userId: string | null | undefined,
): boolean => {
  if (!verifiedOwner || !userId) return false;

  return [...(verifiedOwner.owners ?? []), ...(verifiedOwner.admins ?? [])].some(
    (member) => member.id === userId,
  );
};

/**
 * Whether the reader manages this place.
 *
 * Read from the place's verified owner, which the API only fills once a claim
 * is approved - so a claim still under review does not make anyone a manager,
 * and a visitor is told nothing they could not already see. It stays false
 * until the place and the session have both answered.
 */
export const usePlaceManager = (placeId: string) => {
  const { data: session } = useSession();
  const userId = session?.user?.id ?? undefined;

  const { data: placeResponse, isLoading } = usePlace(placeId, Boolean(userId && placeId));
  const verifiedOwner: PlaceVerifiedOwner | null | undefined = placeResponse?.data?.verifiedOwner;

  return {
    isManager: isVerifiedPlaceOwner(verifiedOwner, userId),
    isLoading,
    owningCommunityId: verifiedOwner?.id,
    owningCommunity: verifiedOwner
      ? { id: verifiedOwner.id, title: verifiedOwner.title }
      : undefined,
  };
};

/** The place's bookability profiles. Public - anyone may list them. */
export const usePlaceReservationProfiles = (placeId: string, enabled = true) =>
  useQuery({
    queryKey: ['placeReservationProfiles', placeId],
    queryFn: async () => await fetchPlaceReservationProfiles(placeId),
    enabled: enabled && Boolean(placeId),
    staleTime: 5 * 60 * 1000,
  });

/** Weekly hours plus one-off overrides, fetched together - both drive one picker. */
export const usePlaceAvailability = (placeId: string, profileId: string | undefined) =>
  useQuery({
    queryKey: ['placeAvailability', placeId, profileId],
    queryFn: async () => await fetchPlaceAvailability(placeId, profileId!),
    enabled: Boolean(placeId && profileId),
    staleTime: 5 * 60 * 1000,
  });

/**
 * The reader's own requests against this place.
 *
 * Asked only of someone signed in: the endpoint 401s otherwise, and an
 * anonymous reader has no reservations to list.
 */
export const usePlaceBookingRequests = (placeId: string, profileId: string | undefined) => {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ['placeBookingRequests', placeId, profileId],
    queryFn: async () => await fetchPlaceBookingRequests(placeId, profileId!),
    enabled: Boolean(placeId && profileId && session?.user?.id),
  });
};

export const useCreatePlaceBookingRequest = (placeId: string, profileId: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreatePlaceBookingRequest) =>
      await createPlaceBookingRequest(placeId, profileId!, data),
    onSuccess: () => {
      // The new request has to show up under "My Reservations" straight away
      queryClient.invalidateQueries({ queryKey: ['placeBookingRequests', placeId, profileId] });
      queryClient.invalidateQueries({ queryKey: ['myPlaceReservations', placeId] });
    },
  });
};

export const useCancelPlaceBookingRequest = (placeId: string, profileId: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (purchaseId: string) => await cancelPlaceBookingRequest(purchaseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['placeBookingRequests', placeId, profileId] });
      queryClient.invalidateQueries({ queryKey: ['myPlaceReservations', placeId] });
    },
  });
};

// The booking-requests list is the venue's and empty for a guest, so a guest's own bookings come off the purchases list
export const useMyPlaceReservations = (placeId: string, profileId: string | undefined) => {
  const { data: session } = useSession();
  const userId = session?.user?.id ?? undefined;

  return useQuery({
    queryKey: ['myPlaceReservations', placeId, profileId, userId],
    queryFn: async () => {
      const profile = await fetchPlaceReservationProfile(placeId, profileId!);
      return await fetchTicketPurchases({ experience: profile.data.experienceId, user: userId });
    },
    enabled: Boolean(placeId && profileId && userId),
  });
};

const useBookingRequestAction = (
  placeId: string,
  profileId: string | undefined,
  action: (purchaseId: string) => Promise<ApiResponse>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (purchaseId: string) => await action(purchaseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['placeBookingRequests', placeId, profileId] });
    },
  });
};

export const useAcceptPlaceBookingRequest = (placeId: string, profileId: string | undefined) =>
  useBookingRequestAction(placeId, profileId, acceptPlaceBookingRequest);

export const useDeclinePlaceBookingRequest = (placeId: string, profileId: string | undefined) =>
  useBookingRequestAction(placeId, profileId, declinePlaceBookingRequest);

export const useAdmitPlaceBookingRequest = (placeId: string, profileId: string | undefined) =>
  useBookingRequestAction(placeId, profileId, admitPlaceBookingRequest);

export const useHoldOffReservations = (placeId: string, profileId: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      replacedExceptionIds,
      exceptions,
    }: {
      replacedExceptionIds: string[];
      exceptions: CreatePlaceAvailabilityException[];
    }) => {
      for (const exceptionId of replacedExceptionIds) {
        await deleteAvailabilityException(placeId, profileId!, exceptionId);
      }
      for (const exception of exceptions) {
        await createAvailabilityException(placeId, profileId!, exception);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['placeAvailability', placeId, profileId] });
    },
  });
};

export const useResumeReservations = (placeId: string, profileId: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (exceptionId: string) =>
      await deleteAvailabilityException(placeId, profileId!, exceptionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['placeAvailability', placeId, profileId] });
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
    mutationFn: async ({ placeId, communityId }: { placeId: string; communityId: string }) => {
      const existing = await fetchPlaceOwnership(placeId).catch(() => null);
      if (existing?.data?.community === communityId) return existing;
      return await claimPlaceOwnership(placeId, communityId);
    },
    onSuccess: (_data, { placeId }) => {
      // A granted claim is what makes the place bookable, so the panel has to
      // re-read its profiles
      queryClient.invalidateQueries({ queryKey: ['placeReservationProfiles', placeId] });
      queryClient.invalidateQueries({ queryKey: ['placeOwnership', placeId] });
    },
  });
};

export const useDeletePlaceOwnership = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (placeId: string) => await deletePlaceOwnership(placeId),
    onSuccess: (_data, placeId) => {
      queryClient.invalidateQueries({ queryKey: ['placeOwnership', placeId] });
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
 * surfaces as a failure - the caller re-reads the place either way.
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
 * activated. Hours are replaced rather than edited - the API creates and
 * deletes rules but does not update them - so a day whose times changed is
 * removed and written again.
 */
export const useSaveReservationSettings = (placeId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (draft: ReservationSettingsDraft) => {
      const { profileId, profile, rules, existingRules, isActive, placePhotos = [] } = draft;

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

      // A draft profile is invisible to diners, so saving settings opens it, once it has a photo
      if (!isActive) {
        await lendPlacePhotosToProfile(placeId, id, placePhotos);
        await activateReservationProfile(placeId, id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['placeReservationProfiles', placeId] });
      queryClient.invalidateQueries({ queryKey: ['placeAvailability', placeId] });
    },
  });
};

/**
 * Places with something on - the "Places with experiences" section.
 */
export const usePlacesWithExperiences = (enabled = true, perPage = 10) =>
  useQuery({
    queryKey: ['places', 'with-experiences', perPage],
    queryFn: async () =>
      await fetchPlaces(1, perPage, undefined, undefined, undefined, undefined, {
        hasExperiences: true,
      }),
    enabled,
  });

/**
 * The places ranked by reviews - the "Popular places" rail. The API orders
 * them by highest average rating, unrated places last, so the order is not
 * re-sorted here.
 */
export const usePopularPlaces = (enabled = true, perPage = 10) =>
  useQuery({
    queryKey: ['places', 'popular', perPage],
    queryFn: async () =>
      await fetchPlaces(1, perPage, undefined, undefined, undefined, undefined, {
        sortBy: 'popular',
      }),
    enabled,
  });

/**
 * The places staff have featured - the "Promoted places" row.
 *
 * `GET /places/featured/` returns them in equal-time rotation order, so this
 * does not re-sort them. The row shows what it found and offers no See all -
 * which is right anyway, since /places lists every place rather than more of
 * these.
 */
export const useFeaturedPlaces = (enabled = true) =>
  useQuery({
    queryKey: ['places', 'featured'],
    queryFn: async () => await fetchFeaturedPlaces(),
    enabled,
  });

/**
 * The places nearest the reader. The API orders them by distance from the
 * coordinates it is sent, so the query only runs once both are known.
 */
export const useNearbyPlaces = (lat?: number, lng?: number, categoryId?: string, perPage = 10) =>
  useQuery({
    queryKey: ['places', 'nearby', { lat, lng, categoryId, perPage }],
    queryFn: async () => await fetchPlaces(1, perPage, categoryId, undefined, lat, lng),
    enabled: lat !== undefined && lng !== undefined,
  });

/**
 * The places in one city, for its rail on /places. The city is a place
 * category, so it goes through the same `category` filter the list uses.
 */
export const usePlacesInCity = (cityCategoryId: string, enabled = true, perPage = 10) =>
  useQuery({
    queryKey: ['places', 'city', cityCategoryId, perPage],
    queryFn: async () => await fetchPlaces(1, perPage, cityCategoryId),
    enabled: enabled && Boolean(cityCategoryId),
  });
