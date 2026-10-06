'use client';

import { usePlaceCategories } from '@/app/shared/hooks/usePlaces';
import { PlaceCategory } from '@/types/placeCategory';

import { CityPlacesRail } from './CityPlacesRail';

/** The most city rails the page shows. Each one is a request of its own. */
export const PLACES_BY_CITY_RAIL_COUNT = 3;

/**
 * A place rail per city, the busiest cities first. Sits beside Discover by
 * city (PL-03), which picks a city; these rails show the places in each one.
 */
export const PlacesByCity = () => {
  const { data: citiesResponse } = usePlaceCategories({ pageSize: 100, group: 'cities' }, true);

  const cities: PlaceCategory[] = (citiesResponse?.data?.results ?? [])
    .filter((category: PlaceCategory) => category.group === 'cities')
    .sort((a: PlaceCategory, b: PlaceCategory) => b.placesCount - a.placesCount)
    .slice(0, PLACES_BY_CITY_RAIL_COUNT);

  return (
    <>
      {cities.map((city) => (
        <CityPlacesRail key={city.id} city={city} />
      ))}
    </>
  );
};
