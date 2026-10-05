'use client';

import { PlaceCard } from '@/app/(experiences)/components/PlaceCard';
import { RowSkeleton } from '@/app/(experiences)/experiences/components/ExperienceRow';
import { CardRail } from '@/app/shared/components/Lists';
import { useFeaturedPlaces } from '@/app/shared/hooks/usePlaces';
import { Place } from '@/types/place';

/** The first cards load eagerly, as they sit in view on arrival. */
const EAGER_IN_RAIL = 3;

/**
 * The places the API marks featured, as a rail. It stays out of the way when
 * nothing is featured, so no empty heading shows.
 */
export const PromotedPlaces = () => {
  const { data: promotedResponse, isLoading } = useFeaturedPlaces();
  const promotedPlaces: Place[] = promotedResponse?.data?.results ?? [];

  if (!isLoading && promotedPlaces.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <CardRail title="Promoted places" subtitle="Handpicked by the communities that run them">
        {isLoading ? (
          <RowSkeleton cardClassName="aspect-square w-[184px]" />
        ) : (
          promotedPlaces.map((place, index) => (
            <PlaceCard key={place.id} place={place} priority={index < EAGER_IN_RAIL} />
          ))
        )}
      </CardRail>
    </div>
  );
};
