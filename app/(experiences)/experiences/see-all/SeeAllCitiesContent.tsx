'use client';

import { CityCard } from '@/app/(experiences)/experiences/components/CityCard';
import { usePlaceCategories } from '@/app/shared/hooks/usePlaces';
import { PlaceCategory, categoryImageOf } from '@/types/placeCategory';

import { SeeAllEmptyState } from './SeeAllEmptyState';
import { SeeAllLayout } from './SeeAllLayout';
import { CITIES_SECTION, cityExperiencesHref } from './config';

const CITIES_GRID = 'mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';

const CitiesGridSkeleton = () => (
  <div className={CITIES_GRID}>
    {Array.from({ length: 8 }).map((_, index) => (
      <div key={index} className="h-[160px] w-full animate-pulse rounded-xl bg-gray-200" />
    ))}
  </div>
);

export const SeeAllCitiesContent = () => {
  const { data: response, isLoading } = usePlaceCategories(
    { pageSize: 100, group: 'cities' },
    true,
  );

  // The group param is passed through, but the listing page filters client-side
  // too — keep doing the same so a non-filtering backend can't leak other groups
  const cities: PlaceCategory[] = (response?.data?.results ?? [])
    .filter((category: PlaceCategory) => category.group === 'cities')
    .sort((a: PlaceCategory, b: PlaceCategory) => b.placesCount - a.placesCount);

  // Every destination arrives in one page, so this is the true total — unlike
  // the experience grids, which take their count from the paginated response
  const count = isLoading ? null : cities.length;

  return (
    <SeeAllLayout title={CITIES_SECTION.title} subtitle={CITIES_SECTION.subtitle(count)}>
      {isLoading ? (
        <CitiesGridSkeleton />
      ) : cities.length === 0 ? (
        <SeeAllEmptyState message="No cities to explore yet" />
      ) : (
        <div className={CITIES_GRID}>
          {cities.map((category) => (
            <CityCard
              key={category.id}
              city={category.name}
              experienceCount={category.placesCount}
              imageUrl={categoryImageOf(category) ?? ''}
              href={cityExperiencesHref(category.name)}
              className="h-[160px] w-full"
            />
          ))}
        </div>
      )}
    </SeeAllLayout>
  );
};
