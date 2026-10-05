'use client';

import { useRef } from 'react';

import Link from 'next/link';

import { SectionHeader } from '@/app/(experiences)/experiences/components/SectionHeader';
import { SingleExperience } from '@/app/shared/components/Experiences/Single';
import { CARD_LIFT } from '@/app/shared/components/Motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Experience } from '@/types/experience';
import { experiencePath } from '@/utils/detail-paths';

interface DiscoverGridProps {
  /** The page on screen. */
  experiences: Experience[];
  /** The API total, which the subtitle and the pager count. */
  total: number;
  page: number;
  onPageChange: (page: number) => void;
  isLoading: boolean;
}

/** Experiences per page in the Discover grid. */
export const DISCOVER_GRID_PAGE_SIZE = 9;

const totalPagesOf = (total: number): number =>
  Math.max(1, Math.ceil(total / DISCOVER_GRID_PAGE_SIZE));

/**
 * Every published experience, nine to a page. The subtitle names the count
 * only, since EL-00 drops the city. Hidden when it loaded empty, so no heading
 * shows alone.
 */
export const DiscoverGrid = ({
  experiences,
  total,
  page,
  onPageChange,
  isLoading,
}: DiscoverGridProps) => {
  const sectionRef = useRef<HTMLDivElement>(null);

  if (!isLoading && experiences.length === 0) {
    return null;
  }

  const totalPages = totalPagesOf(total);
  const subtitle =
    isLoading && total === 0 ? undefined : `${total} ${total === 1 ? 'experience' : 'experiences'}`;

  // Paging sits under the grid, so a new page is brought back to the heading
  const changePage = (next: number) => {
    onPageChange(next);
    sectionRef.current?.scrollIntoView?.({ block: 'start', behavior: 'smooth' });
  };

  return (
    <div ref={sectionRef} className="scroll-mt-24">
      <SectionHeader title="Discover experiences" subtitle={subtitle} />

      {isLoading ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(168px,1fr))] gap-x-4 gap-y-[26px]">
          {Array.from({ length: DISCOVER_GRID_PAGE_SIZE }).map((_, index) => (
            <div key={index} className="aspect-square animate-pulse rounded-xl bg-gray-200" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(168px,1fr))] gap-x-4 gap-y-[26px]">
          {experiences.map((experience) => (
            <Link
              key={experience.id}
              target="_blank"
              href={experiencePath(experience)}
              className={cn('group block min-w-0', CARD_LIFT)}
            >
              <SingleExperience type="discover" variant="row" experience={experience} />
            </Link>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <nav
          aria-label="Discover experiences pages"
          className="mt-8 flex items-center justify-center gap-4"
        >
          <Button
            variant="canvas-outline"
            size="sm"
            className="rounded-full px-4"
            disabled={page <= 1 || isLoading}
            onClick={() => changePage(page - 1)}
          >
            Previous
          </Button>
          <span className="text-13 text-ink-muted" aria-current="page">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="canvas-outline"
            size="sm"
            className="rounded-full px-4"
            disabled={page >= totalPages || isLoading}
            onClick={() => changePage(page + 1)}
          >
            Next
          </Button>
        </nav>
      )}
    </div>
  );
};
