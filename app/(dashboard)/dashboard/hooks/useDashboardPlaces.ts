import { useMemo } from 'react';

import { useQueries } from '@tanstack/react-query';

import { claimStatusFrom } from '@/app/shared/components/Places/ConnectPlaceDrawer/useResolvedClaim';
import { useGetCommunities } from '@/app/shared/hooks/useCommunities';
import { useMyPlaces, usePlaceOwnerships } from '@/app/shared/hooks/usePlaces';
import { useConnectPlaceDrawer } from '@/context/ConnectPlaceDrawerContext';
import { usePlaceDrawer } from '@/context/PlaceDrawerContext';
import { fetchPlaceBookingRequests, fetchPlaceReservationProfiles } from '@/services/place';
import { Claim } from '@/types/claim';
import { Community } from '@/types/community';
import { Photo } from '@/types/photo';
import { Place } from '@/types/place';
import { PlaceBookingRequest } from '@/types/placeReservation';
import { placePath } from '@/utils/detail-paths';

const coverOf = (place: Place): string | undefined =>
  place.photos?.find((photo: Photo) => photo.isCover)?.photo || place.photos?.[0]?.photo;

export interface DashboardPlaceStat {
  label: string;
  value: string;
  alert: boolean;
  onClick: () => void;
}

export interface DashboardPlaceItem {
  id: string;
  name: string;
  locality: string;
  image?: string;
  onOpenHref: string;
  stats: DashboardPlaceStat[];
}

/**
 * The Dashboard's "My places" section: places claimed by a community this
 * person owns, with a per-place reservation-request count fanned out the same
 * way the old Control Center fanned out ticket purchases (there is no
 * host-wide "all my places' requests" endpoint). Boost has no data model
 * anywhere in the app yet, so its stat chip is omitted - see the Dashboard
 * backend-gaps note.
 */
export const useDashboardPlaces = (userId: string | undefined) => {
  const { data: placesResponse, isLoading: isLoadingPlaces } = useMyPlaces(Boolean(userId));
  const places: Place[] = placesResponse?.data?.results ?? [];
  const placeDrawer = usePlaceDrawer();

  const profileQueries = useQueries({
    queries: places.map((place) => ({
      queryKey: ['placeReservationProfiles', place.id],
      queryFn: () => fetchPlaceReservationProfiles(place.id),
      enabled: Boolean(userId),
      retry: false,
    })),
  });

  const profileIdByPlace = new Map<string, string | null>(
    places.map((place, index) => {
      const profileId = profileQueries[index]?.data?.data?.id;
      return [place.id, profileId ?? null];
    }),
  );

  const requestQueries = useQueries({
    queries: places.map((place) => {
      const profileId = profileIdByPlace.get(place.id);
      return {
        queryKey: ['placeBookingRequests', place.id, profileId],
        queryFn: () => fetchPlaceBookingRequests(place.id, profileId!),
        enabled: Boolean(userId && profileId),
      };
    }),
  });

  const items: DashboardPlaceItem[] = places.map((place, index) => {
    const profileId = profileIdByPlace.get(place.id);
    const requests: PlaceBookingRequest[] = requestQueries[index]?.data?.data?.results ?? [];
    const pending = requests.filter((request) => request.status === 'requested').length;

    // Stacks the same drawer every other entry point opens, rather than
    // navigating to a dedicated page - a profile already set up goes straight
    // to its requests, not back through the settings that made it
    const reservationStat: DashboardPlaceStat = profileId
      ? {
          label: 'Reservation requests',
          value: String(pending),
          alert: pending > 0,
          onClick: () => placeDrawer?.openPlace(place.id, { view: 'requests' }),
        }
      : {
          label: 'Set up reservations',
          value: '',
          alert: false,
          onClick: () => placeDrawer?.openPlace(place.id, { view: 'reservations' }),
        };

    return {
      id: place.id,
      name: place.title,
      locality: place.location?.city ?? '',
      image: coverOf(place),
      onOpenHref: placePath(place),
      stats: [reservationStat],
    };
  });

  const pendingRequestCount = items.reduce(
    (sum, item) => sum + (item.stats[0]?.alert ? Number(item.stats[0].value) : 0),
    0,
  );

  const connectDrawer = useConnectPlaceDrawer();
  const sentClaims = useMemo(
    () => (connectDrawer?.claims ?? []).filter((claim) => claim.status !== 'cancelled'),
    [connectDrawer?.claims],
  );

  // The stored claim keeps the status it was sent with, which is always
  // 'review' - so a claim approved on the backend still read "Under review"
  // here. The API is the source of truth: the store only remembers which
  // places were claimed together (the API has no claim record to list), and
  // each one's status is read live, by the same rule the Connect a place
  // drawer uses for "Your claim".
  const claimedPlaceIds = useMemo(
    () => Array.from(new Set(sentClaims.flatMap((claim) => claim.places.map((place) => place.id)))),
    [sentClaims],
  );
  const ownershipQueries = usePlaceOwnerships(claimedPlaceIds, Boolean(userId), 0);
  const ownershipByPlace = new Map(
    claimedPlaceIds.map((placeId, index) => {
      const response = ownershipQueries[index]?.data;
      return [
        placeId,
        response
          ? { exists: Boolean(response.data), approved: Boolean(response.data?.approved) }
          : null,
      ];
    }),
  );

  // Only for a rejection - the community's verification is what turns one down
  const { data: communitiesResponse } = useGetCommunities({
    page: 1,
    enabled: Boolean(userId) && sentClaims.length > 0,
    createdBy: userId,
  });
  const communities: Community[] = communitiesResponse?.data?.results ?? [];

  // A place in My places is one the API already counts as this person's, so
  // its claim is settled even before its ownership lookup comes back
  const ownedPlaceIds = new Set(places.map((place) => place.id));

  const resolvedClaims: Claim[] = sentClaims.map((claim) => ({
    ...claim,
    status:
      claim.places.length > 0 && claim.places.every((place) => ownedPlaceIds.has(place.id))
        ? 'approved'
        : claimStatusFrom({
            sentStatus: claim.status,
            ownerships: claim.places.map((place) => ownershipByPlace.get(place.id) ?? null),
            verificationStatus: communities.find((community) => community.id === claim.communityId)
              ?.verificationStatus,
          }),
  }));

  // An approved claim leaves this list: its place is in My places now
  const claims: Claim[] = resolvedClaims.filter(
    (claim) => claim.status !== 'cancelled' && claim.status !== 'approved',
  );

  return {
    isLoading: isLoadingPlaces,
    places: items,
    pendingRequestCount,
    claims,
    onConnectPlace: () => connectDrawer?.openConnectPlace(),
    onOpenClaim: (claimId: string) => connectDrawer?.openConnectPlace({ claimId }),
  };
};
