'use client';

import { PlaceCard } from '@/app/(experiences)/components/PlaceCard';
import { RowSkeleton } from '@/app/(experiences)/experiences/components/ExperienceRow';
import { CardRail } from '@/app/shared/components/Lists';
import { usePopularPlaces } from '@/app/shared/hooks/usePlaces';
import { Place } from '@/types/place';

/** The first cards load eagerly, as they sit in view on arrival. */
const EAGER_IN_RAIL = 3;

export const POPULAR_PLACES_SUBTITLE = 'Ranked by reviews';

/**
 * The places ranked by reviews, as a rail. The order comes from the API's
 * `sort_by=popular`. Hidden when it loaded empty, so no heading shows alone.
 */
export const PopularPlaces = () => {
  const { data: popularResponse, isLoading } = usePopularPlaces();
  const popularPlaces: Place[] = popularResponse?.data?.results ?? [];

  if (!isLoading && popularPlaces.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <CardRail title="Popular places" subtitle={POPULAR_PLACES_SUBTITLE}>
        {isLoading ? (
          <RowSkeleton cardClassName="aspect-square w-[184px]" />
        ) : (
          popularPlaces.map((place, index) => (
            <PlaceCard key={place.id} place={place} priority={index < EAGER_IN_RAIL} />
          ))
        )}
      </CardRail>
    </div>
  );
};
