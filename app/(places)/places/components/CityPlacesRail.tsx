'use client';

import { PlaceCard } from '@/app/(experiences)/components/PlaceCard';
import { RowSkeleton } from '@/app/(experiences)/experiences/components/ExperienceRow';
import { CardRail } from '@/app/shared/components/Lists';
import { usePlacesInCity } from '@/app/shared/hooks/usePlaces';
import { Place } from '@/types/place';
import { PlaceCategory } from '@/types/placeCategory';

/** The first cards load eagerly, as they sit in view on arrival. */
const EAGER_IN_RAIL = 3;

/**
 * One city's places as a rail, titled with the city. Hidden when the city
 * loaded empty, so no heading shows alone.
 */
export const CityPlacesRail = ({ city }: { city: PlaceCategory }) => {
  const { data: cityResponse, isLoading } = usePlacesInCity(city.id);
  const places: Place[] = cityResponse?.data?.results ?? [];

  if (!isLoading && places.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <CardRail title={`Places in ${city.name}`}>
        {isLoading ? (
          <RowSkeleton cardClassName="aspect-square w-[184px]" />
        ) : (
          places.map((place, index) => (
            <PlaceCard key={place.id} place={place} priority={index < EAGER_IN_RAIL} />
          ))
        )}
      </CardRail>
    </div>
  );
};
