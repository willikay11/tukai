'use client';

import { SectionHeader } from '@/app/(experiences)/experiences/components/SectionHeader';
import { useNearbyPlaces, usePlaceCategories } from '@/app/shared/hooks/usePlaces';
import { useLocation } from '@/context/LocationContext';
import { useSelectedCategory } from '@/context/SelectedCategoryContext';
import { Place } from '@/types/place';
import { PlaceCategory } from '@/types/placeCategory';
import { greatCircleKm } from '@/utils/geo-utils';

import { NearbyPlaceCard } from './NearbyPlaceCard';

/** The most places the grid shows. */
export const NEARBY_PLACES_COUNT = 8;

/** The noun the title falls back to while no category is selected. */
export const NEARBY_PLACES_DEFAULT_NOUN = 'restaurants';

/** Only ever shown with an origin, so it never implies a centre the reader is not at. */
export const NEARBY_PLACES_SUBTITLE = 'Sorted by distance from you';

/** A place with no coordinates sorts after every place that has some. */
const UNKNOWN_DISTANCE = Number.MAX_SAFE_INTEGER;

const distanceTo = (place: Place, lat: number, lng: number): number => {
  const placeLat = place.location?.pointLat;
  const placeLng = place.location?.pointLong;
  return placeLat && placeLng ? greatCircleKm(lat, lng, placeLat, placeLng) : UNKNOWN_DISTANCE;
};

/**
 * The places nearest the reader, as a grid sorted by distance from them. It
 * follows the category picked in the row above: the title names it and the
 * places are of that category. It needs an origin: until the reader has shared
 * their location and is using it, the section is hidden rather than shown
 * unordered. Also hidden when it loaded empty, so no heading shows alone.
 */
export const NearbyPlaces = () => {
  const { lat, lng, isUsingLocation } = useLocation();
  const { selectedCategoryId } = useSelectedCategory();
  const { data: categoriesResponse } = usePlaceCategories({ pageSize: 100 }, true);

  // 'all' and no selection both mean no category filter
  const selectedCategory = (categoriesResponse?.data?.results as PlaceCategory[] | undefined)?.find(
    (category) => category.id === selectedCategoryId,
  );
  const noun = selectedCategory?.name.toLowerCase() ?? NEARBY_PLACES_DEFAULT_NOUN;

  const { data: nearbyResponse, isLoading } = useNearbyPlaces(
    isUsingLocation ? lat : undefined,
    isUsingLocation ? lng : undefined,
    selectedCategory?.id,
  );

  if (!isUsingLocation || lat === undefined || lng === undefined) {
    return null;
  }

  // The API's order is not trusted, so the nearest are picked here
  const nearby: { place: Place; km?: number }[] = (nearbyResponse?.data?.results ?? [])
    .map((place: Place) => ({ place, km: distanceTo(place, lat, lng) }))
    .sort((a: { km: number }, b: { km: number }) => a.km - b.km)
    .slice(0, NEARBY_PLACES_COUNT)
    .map(({ place, km }: { place: Place; km: number }) => ({
      place,
      km: km === UNKNOWN_DISTANCE ? undefined : km,
    }));

  if (!isLoading && nearby.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <SectionHeader title={`Nearby ${noun}`} subtitle={NEARBY_PLACES_SUBTITLE} />
      <div className="mt-4 grid grid-cols-[repeat(auto-fill,minmax(min(100%,280px),1fr))] gap-x-4 gap-y-3">
        {isLoading
          ? Array.from({ length: NEARBY_PLACES_COUNT }, (_, index) => (
              <div key={index} className="h-[96px] animate-pulse rounded-xl bg-gray-200" />
            ))
          : nearby.map(({ place, km }) => (
              <NearbyPlaceCard key={place.id} place={place} distanceKm={km} />
            ))}
      </div>
    </div>
  );
};
