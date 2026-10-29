import { useQueries } from '@tanstack/react-query';

import { useMyPlaces } from '@/app/shared/hooks/usePlaces';
import { useConnectPlaceDrawer } from '@/context/ConnectPlaceDrawerContext';
import { fetchPlaceBookingRequests, fetchPlaceReservationProfiles } from '@/services/place';
import { Claim } from '@/types/claim';
import { Photo } from '@/types/photo';
import { Place } from '@/types/place';
import { PlaceBookingRequest } from '@/types/placeReservation';
import { placePath } from '@/utils/detail-paths';

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

const coverOf = (place: Place): string | undefined =>
  place.photos?.find((photo: Photo) => photo.isCover)?.photo || place.photos?.[0]?.photo;

export interface DashboardPlaceStat {
  label: string;
  value: string;
  alert: boolean;
  href: string;
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
    const reservationsHref = `/control-center/places/${place.id}/reservations`;

    const reservationStat: DashboardPlaceStat = profileId
      ? {
          label: 'Reservation requests',
          value: String(pending),
          alert: pending > 0,
          href: reservationsHref,
        }
      : { label: 'Set up reservations', value: '', alert: false, href: reservationsHref };

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
  // "Approved" has no decidedAt on Claim yet - approximated with sentAt, see
  // the Dashboard backend-gaps note.
  const claims: Claim[] = (connectDrawer?.claims ?? []).filter(
    (claim) =>
      claim.status !== 'cancelled' &&
      (claim.status !== 'approved' || Date.now() - new Date(claim.sentAt).getTime() < SEVEN_DAYS_MS),
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
