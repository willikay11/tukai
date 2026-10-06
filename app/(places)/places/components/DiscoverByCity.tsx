'use client';

import { CityCard } from '@/app/(experiences)/experiences/components/CityCard';
import { RowSkeleton } from '@/app/(experiences)/experiences/components/ExperienceRow';
import { CardRail } from '@/app/shared/components/Lists';
import { usePlaceCategories } from '@/app/shared/hooks/usePlaces';
import { useSelectedCategory } from '@/context/SelectedCategoryContext';
import { PlaceCategory, categoryImageOf } from '@/types/placeCategory';

/** The most cities the rail offers, the same as Discover's city rail. */
const CITY_RAIL_SIZE = 10;

export const DISCOVER_BY_CITY_SUBTITLE = 'Switch the city and this page follows';

/**
 * Places by city: a rail of city cards. Picking one narrows the place list
 * below to that city, and picking it again lets go of it. Hidden when it loaded
 * empty, so no heading shows alone.
 */
export const DiscoverByCity = () => {
  const { selectedCitySearchId, setSelectedCitySearchId } = useSelectedCategory();
  const { data: citiesResponse, isLoading } = usePlaceCategories(
    { pageSize: 100, group: 'cities' },
    true,
  );

  const cities: PlaceCategory[] = (citiesResponse?.data?.results ?? [])
    .filter((category: PlaceCategory) => category.group === 'cities')
    .sort((a: PlaceCategory, b: PlaceCategory) => b.placesCount - a.placesCount)
    .slice(0, CITY_RAIL_SIZE);

  if (!isLoading && cities.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <CardRail title="Discover by city" subtitle={DISCOVER_BY_CITY_SUBTITLE}>
        {isLoading ? (
          <RowSkeleton cardClassName="h-[65px] w-[184px]" />
        ) : (
          cities.map((category) => {
            const isSelected = category.id === selectedCitySearchId;

            return (
              <CityCard
                key={category.id}
                city={category.name}
                imageUrl={categoryImageOf(category) ?? ''}
                href=""
                variant="banner"
                className="aspect-auto h-[65px]"
                selected={isSelected}
                onSelect={() => setSelectedCitySearchId(isSelected ? '' : category.id)}
              />
            );
          })
        )}
      </CardRail>
    </div>
  );
};
