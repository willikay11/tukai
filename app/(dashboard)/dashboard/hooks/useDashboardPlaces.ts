import { useMemo } from 'react';

import { useQueries } from '@tanstack/react-query';

import { useMyPlaces, usePlaceBookings } from '@/app/shared/hooks/usePlaces';
import { useConnectPlaceDrawer } from '@/context/ConnectPlaceDrawerContext';
import { usePlaceDrawer } from '@/context/PlaceDrawerContext';
import { fetchPlaceBoosts, fetchPlaceReservationProfiles } from '@/services/place';
import { Claim } from '@/types/claim';
import { Photo } from '@/types/photo';
import { Place } from '@/types/place';
import { boostDay, boostStateOf } from '@/types/placeBoost';
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
 * person owns, each with how many reservation requests are waiting - read in
 * one request across every place they manage (DEV-388), not one per place.
 * Each place also says whether it's boosted, and opens Boost (DEV-392).
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

  // Every request waiting for an answer, at every place this person manages
  const { data: waiting } = usePlaceBookings('host', {
    bookingStatus: 'requested',
    enabled: Boolean(userId) && places.length > 0,
  });
  const waitingByPlace = new Map<string, number>();
  for (const booking of waiting ?? []) {
    const placeId = booking.experience?.place?.id;
    if (placeId) waitingByPlace.set(placeId, (waitingByPlace.get(placeId) ?? 0) + 1);
  }

  // Each place's boosts, for "Boosted until" (DEV-392)
  const boostQueries = useQueries({
    queries: places.map((place) => ({
      queryKey: ['placeBoosts', place.id],
      queryFn: () => fetchPlaceBoosts(place.id),
      enabled: Boolean(userId),
      retry: false,
    })),
  });

  const items: DashboardPlaceItem[] = places.map((place, index) => {
    const profileId = profileIdByPlace.get(place.id);
    const pending = waitingByPlace.get(place.id) ?? 0;

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

    const boosts = boostQueries[index]?.data;
    const { boostedUntil } = boostStateOf(Array.isArray(boosts) ? boosts : []);
    const boostStat: DashboardPlaceStat = {
      label: boostedUntil ? 'Boosted until' : 'Boost this place',
      value: boostedUntil ? boostDay(boostedUntil) : '',
      alert: false,
      onClick: () => placeDrawer?.openPlace(place.id, { view: 'boost' }),
    };

    return {
      id: place.id,
      name: place.title,
      locality: place.location?.city ?? '',
      image: coverOf(place),
      onOpenHref: placePath(place),
      stats: [reservationStat, boostStat],
    };
  });

  const pendingRequestCount = items.reduce(
    (sum, item) => sum + (item.stats[0]?.alert ? Number(item.stats[0].value) : 0),
    0,
  );

  // The person's claims, from the server merged with what this browser sent
  // (DEV-391): an approved one leaves this list, its place is in My places now
  const connectDrawer = useConnectPlaceDrawer();
  const claims: Claim[] = useMemo(
    () =>
      (connectDrawer?.claims ?? []).filter(
        (claim) => claim.status !== 'cancelled' && claim.status !== 'approved',
      ),
    [connectDrawer?.claims],
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
