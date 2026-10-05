'use client';

import { CommunityRow } from '@/app/(experiences)/components/CommunityRow';
import { ROW_GRID, RowGridSkeleton } from '@/app/(experiences)/components/MediaRow';
import { SectionHeader } from '@/app/(experiences)/experiences/components/SectionHeader';
import { Community } from '@/types/community';

interface CommunitiesSectionProps {
  /** The first page of communities that have something coming up. */
  communities: Community[];
  /** The API total, which decides whether See all is offered. */
  total: number;
  isLoading: boolean;
}

/** Communities the section shows, as the design's grid holds them. */
export const COMMUNITIES_PAGE_SIZE = 8;

/** Rows past this many are fetched lazily rather than straight away. */
const EAGER_ROWS = 3;

/**
 * The communities running what is on. A grid of community rows under the
 * heading, as the design has it - not a horizontal rail. See all is offered
 * only when the API holds more than the grid shows.
 *
 * The subtitle drops the city until EL-00 is revisited.
 */
export const CommunitiesSection = ({ communities, total, isLoading }: CommunitiesSectionProps) => {
  // Hide the whole section when it loaded empty, so no heading shows alone
  if (!isLoading && communities.length === 0) {
    return null;
  }

  const shown = communities.slice(0, COMMUNITIES_PAGE_SIZE);
  const hasMore = total > shown.length;

  return (
    <section>
      <SectionHeader
        title="Communities"
        subtitle="Running what is on"
        seeAllHref={hasMore ? '/communities' : undefined}
      />

      {isLoading ? (
        <RowGridSkeleton rows={COMMUNITIES_PAGE_SIZE} />
      ) : (
        <div className={ROW_GRID}>
          {shown.map((community, index) => (
            <CommunityRow key={community.id} community={community} priority={index < EAGER_ROWS} />
          ))}
        </div>
      )}
    </section>
  );
};
