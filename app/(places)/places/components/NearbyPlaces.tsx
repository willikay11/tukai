'use client';

import { PlaceCard } from '@/app/(experiences)/components/PlaceCard';
import { RowSkeleton } from '@/app/(experiences)/experiences/components/ExperienceRow';
import { CardRail } from '@/app/shared/components/Lists';
import { useNearbyPlaces } from '@/app/shared/hooks/usePlaces';
import { useLocation } from '@/context/LocationContext';
import { Place } from '@/types/place';
import { haversineKm } from '@/utils/geo-utils';

/** The first cards load eagerly, as they sit in view on arrival. */
const EAGER_IN_RAIL = 3;

/** A place with no coordinates sorts after every place that has some. */
const UNKNOWN_DISTANCE = Number.MAX_SAFE_INTEGER;

/** Only ever shown with an origin, so it never implies a centre the reader is not at. */
export const NEARBY_PLACES_SUBTITLE = 'Sorted by distance from you';

const distanceTo = (place: Place, lat: number, lng: number): number => {
  const placeLat = place.location?.pointLat;
  const placeLng = place.location?.pointLong;
  return placeLat && placeLng ? haversineKm(lat, lng, placeLat, placeLng) : UNKNOWN_DISTANCE;
};

/**
 * The places nearest the reader, as a rail sorted by distance from them. It
 * needs an origin: until the reader has shared their location and is using it,
 * the rail is hidden rather than shown unordered. Also hidden when it loaded
 * empty, so no heading shows alone.
 */
export const NearbyPlaces = () => {
  const { lat, lng, isUsingLocation } = useLocation();
  const { data: nearbyResponse, isLoading } = useNearbyPlaces(
    isUsingLocation ? lat : undefined,
    isUsingLocation ? lng : undefined,
  );

  if (!isUsingLocation || lat === undefined || lng === undefined) {
    return null;
  }

  const nearbyPlaces: Place[] = (nearbyResponse?.data?.results ?? [])
    .map((place: Place) => ({ place, km: distanceTo(place, lat, lng) }))
    .sort((a: { km: number }, b: { km: number }) => a.km - b.km)
    .map((entry: { place: Place }) => entry.place);

  if (!isLoading && nearbyPlaces.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <CardRail title="Nearby places" subtitle={NEARBY_PLACES_SUBTITLE}>
        {isLoading ? (
          <RowSkeleton cardClassName="aspect-square w-[184px]" />
        ) : (
          nearbyPlaces.map((place, index) => (
            <PlaceCard key={place.id} place={place} priority={index < EAGER_IN_RAIL} />
          ))
        )}
      </CardRail>
    </div>
  );
};
