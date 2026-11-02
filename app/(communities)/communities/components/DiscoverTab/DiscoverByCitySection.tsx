'use client';

import { CityCard } from '@/app/(experiences)/experiences/components/CityCard';
import { RowSkeleton } from '@/app/(experiences)/experiences/components/ExperienceRow';
import { CardRail, RAIL_CARD_RESPONSIVE_WIDTH } from '@/app/shared/components/Lists';
import { useToast } from '@/app/shared/hooks/useToast';
import { usePlaceCategories } from '@/app/shared/hooks/usePlaces';
import { useLocation } from '@/context/LocationContext';
import { PlaceCategory, categoryImageOf } from '@/types/placeCategory';

/** The most cities the rail offers - the same as the Experiences page's own rail. */
const CITY_RAIL_SIZE = 10;

/**
 * "Discover by city": picking a city here sets it for the whole app (via
 * `LocationContext`), not just this page - unlike the Places page's own
 * "Discover by city" rail, which only narrows its own list.
 */
export const DiscoverByCitySection = () => {
  const { setCity } = useLocation();
  const { toast } = useToast();
  const { data: citiesResponse, isLoading } = usePlaceCategories(
    { pageSize: 100, group: 'cities' },
    true,
  );

  const cities: PlaceCategory[] = (citiesResponse?.data?.results ?? [])
    .filter((category: PlaceCategory) => category.group === 'cities')
    .sort((a: PlaceCategory, b: PlaceCategory) => b.placesCount - a.placesCount)
    .slice(0, CITY_RAIL_SIZE);

  if (!isLoading && cities.length === 0) return null;

  return (
    <div className="mt-8">
      <CardRail title="Discover by city" subtitle="Switch the city and this page follows">
        {isLoading ? (
          <RowSkeleton cardClassName="h-[65px] w-[184px]" />
        ) : (
          cities.map((category) => (
            <CityCard
              key={category.id}
              city={category.name}
              imageUrl={categoryImageOf(category) ?? ''}
              href=""
              variant="banner"
              className={`aspect-auto h-[65px] ${RAIL_CARD_RESPONSIVE_WIDTH}`}
              onSelect={() => {
                setCity(category.name);
                toast({ description: `Showing ${category.name}.` });
              }}
            />
          ))
        )}
      </CardRail>
    </div>
  );
};
