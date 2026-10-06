'use client';

import { CityCard } from '@/app/(experiences)/experiences/components/CityCard';
import { RowSkeleton } from '@/app/(experiences)/experiences/components/ExperienceRow';
import { cityExperiencesHref } from '@/app/(experiences)/experiences/see-all/config';
import { CardRail } from '@/app/shared/components/Lists';
import { PlaceCategory, categoryImageOf } from '@/types/placeCategory';

interface CitiesRailProps {
  /** Every city, already ordered. The header arrows page through them. */
  cities: PlaceCategory[];
  isLoading: boolean;
  /** The city the reader has picked, which its card shows as pressed. */
  selectedCity?: string;
  onSelectCity: (city: string) => void;
}

export const CITIES_RAIL_SUBTITLE = 'Switch the city and this page follows';

/**
 * Experiences by city: a rail of city cards. Picking one switches the city the
 * page follows. Hidden when it loaded empty, so no heading shows alone.
 */
export const CitiesRail = ({ cities, isLoading, selectedCity, onSelectCity }: CitiesRailProps) => {
  if (!isLoading && cities.length === 0) {
    return null;
  }

  return (
    <CardRail title="Experiences by city" subtitle={CITIES_RAIL_SUBTITLE}>
      {isLoading ? (
        <RowSkeleton cardClassName="h-[65px] w-[184px]" />
      ) : (
        cities.map((category) => (
          <CityCard
            key={category.id}
            city={category.name}
            imageUrl={categoryImageOf(category) ?? ''}
            href={cityExperiencesHref(category.name)}
            variant="banner"
            className="aspect-auto h-[65px]"
            selected={category.name === selectedCity}
            onSelect={() => onSelectCity(category.name)}
          />
        ))
      )}
    </CardRail>
  );
};
