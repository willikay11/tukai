'use client';

import { NearbyPlaceCard } from '@/app/(places)/places/components/NearbyPlaceCard';
import { CardRail } from '@/app/shared/components/Lists';
import { usePlaces } from '@/app/shared/hooks/usePlaces';
import { useLocation } from '@/context/LocationContext';
import { Place } from '@/types/place';
import { PlaceCategory } from '@/types/placeCategory';
import { greatCircleKm } from '@/utils/geo-utils';

import { RailPlaceCardSkeleton } from './RailPlaceCardSkeleton';

/** A place with no coordinates sorts after every place that has some. */
const UNKNOWN_DISTANCE = Number.MAX_SAFE_INTEGER;

/**
 * One place category as a rail between runs of moments, titled with the
 * category. Its cards carry no open/closed pill: hours are not on the list
 * serializer (MO-08). Hidden when the category loaded empty, so no heading
 * shows alone.
 */
export const MomentsBreakRail = ({ category }: { category: PlaceCategory }) => {
  const { lat, lng, isUsingLocation } = useLocation();
  const origin = isUsingLocation && lat !== undefined && lng !== undefined ? { lat, lng } : null;

  const { data: placesResponse, isLoading } = usePlaces({
    categoryId: category.id,
    page: 1,
    enabled: true,
    lat: origin?.lat,
    lng: origin?.lng,
  });

  // With an origin the rail runs nearest first, and a place with no coordinates
  // goes last with no distance line. Without one the API's order stands.
  const places = ((placesResponse?.data?.results ?? []) as Place[])
    .map((place) => {
      const placeLat = place.location?.pointLat;
      const placeLng = place.location?.pointLong;
      const km =
        origin && placeLat && placeLng
          ? greatCircleKm(origin.lat, origin.lng, placeLat, placeLng)
          : UNKNOWN_DISTANCE;

      return { place, km };
    })
    .sort((a, b) => (origin ? a.km - b.km : 0))
    .map(({ place, km }) => ({
      place,
      km: km === UNKNOWN_DISTANCE ? undefined : km,
    }));

  if (!isLoading && places.length === 0) {
    return null;
  }

  return (
    <div className="my-8">
      <CardRail title={category.name}>
        {isLoading
          ? Array.from({ length: 4 }, (_, index) => <RailPlaceCardSkeleton key={index} />)
          : places.map(({ place, km }) => (
              <div key={place.id} className="w-[280px] flex-shrink-0 snap-start">
                <NearbyPlaceCard place={place} distanceKm={km} />
              </div>
            ))}
      </CardRail>
    </div>
  );
};
