'use client';

import { PlaceCard } from '@/app/(experiences)/components/PlaceCard';
import { RowSkeleton } from '@/app/(experiences)/experiences/components/ExperienceRow';
import { CardRail } from '@/app/shared/components/Lists';
import { usePlacesWithExperiences } from '@/app/shared/hooks/usePlaces';
import { Place } from '@/types/place';

/** The first cards load eagerly, as they sit in view on arrival. */
const EAGER_IN_RAIL = 3;

/** Same copy as the Discover section. The city is left out, per PL-00. */
export const PLACES_WITH_EXPERIENCES_SUBTITLE = 'Each one shows what is happening inside';

/**
 * The places with something on, as a rail. The same data as the Discover
 * section. It stays out of the way when none has an experience, so no empty
 * heading shows.
 */
export const PlacesWithExperiences = () => {
  const { data: withExperiencesResponse, isLoading } = usePlacesWithExperiences();
  const placesWithExperiences: Place[] = withExperiencesResponse?.data?.results ?? [];

  if (!isLoading && placesWithExperiences.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <CardRail title="Places with experiences" subtitle={PLACES_WITH_EXPERIENCES_SUBTITLE}>
        {isLoading ? (
          <RowSkeleton cardClassName="aspect-square w-[184px]" />
        ) : (
          placesWithExperiences.map((place, index) => (
            <PlaceCard key={place.id} place={place} priority={index < EAGER_IN_RAIL} />
          ))
        )}
      </CardRail>
    </div>
  );
};
