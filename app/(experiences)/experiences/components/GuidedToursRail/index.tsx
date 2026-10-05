'use client';

import { ExperienceCard } from '@/app/(experiences)/components/ExperienceCard';
import { RowSkeleton } from '@/app/(experiences)/experiences/components/ExperienceRow';
import { CardRail } from '@/app/shared/components/Lists';
import { Experience } from '@/types/experience';

interface GuidedToursRailProps {
  /** The first page of guide_booking experiences. */
  tours: Experience[];
  /** The API total, which the subtitle counts. */
  total: number;
  isLoading: boolean;
  /** Whether the reader has shared a location, which the subtitle says. */
  hasLocation: boolean;
}

/** Tours the rail asks for - the same count Discover shows. */
export const GUIDED_TOURS_PAGE_SIZE = 10;

/** Cards past this many in the rail are fetched lazily rather than straight away. */
const EAGER_IN_ROW = 3;

/**
 * The subtitle drops the city until EL-00 is revisited. The count is the whole
 * published total, not a per-city one, so it is worded as a total.
 */
export const guidedToursSubtitle = (total: number, hasLocation: boolean): string => {
  const noun = total === 1 ? 'tour' : 'tours';
  const scope = hasLocation ? ' near you' : '';

  return `${total} ${noun} led by local guides${scope}`;
};

/**
 * Guided tours: experiences a guide runs, shown as a rail under the heading.
 * Hidden when it loaded empty, so no heading shows alone.
 */
export const GuidedToursRail = ({ tours, total, isLoading, hasLocation }: GuidedToursRailProps) => {
  if (!isLoading && tours.length === 0) {
    return null;
  }

  return (
    <CardRail
      title="Guided tours"
      subtitle={isLoading ? undefined : guidedToursSubtitle(total, hasLocation)}
    >
      {isLoading ? (
        <RowSkeleton cardClassName="aspect-square w-[184px]" />
      ) : (
        tours.map((tour, index) => (
          <ExperienceCard key={tour.id} experience={tour} priority={index < EAGER_IN_ROW} />
        ))
      )}
    </CardRail>
  );
};
