'use client';

import { ReactNode, useRef } from 'react';

import { ExperienceCard } from '@/app/(experiences)/components/ExperienceCard';
import { SectionHeader } from '@/app/(experiences)/experiences/components/SectionHeader';
import { Button } from '@/components/ui/button';
import { NoData } from '@/components/ui/noData';
import { Experience } from '@/types/experience';

interface DiscoverGridProps {
  /** The page on screen. */
  experiences: Experience[];
  /** The API total, which the subtitle and the pager count. */
  total: number;
  page: number;
  onPageChange: (page: number) => void;
  isLoading: boolean;
  /**
   * Filters that sit under the heading and stick under the top bar as the grid
   * scrolls. Kept even when the filtered grid is empty, so a reader can always
   * get back out of a category with nothing in it.
   */
  filters?: ReactNode;
}

/** Experiences per page in the Discover grid. */
export const DISCOVER_GRID_PAGE_SIZE = 9;

const totalPagesOf = (total: number): number =>
  Math.max(1, Math.ceil(total / DISCOVER_GRID_PAGE_SIZE));

/**
 * Every published experience, nine to a page. The subtitle names the count
 * only, since EL-00 drops the city. Hidden when it loaded empty, so no heading
 * shows alone - unless there are filters to keep on screen.
 */
export const DiscoverGrid = ({
  experiences,
  total,
  page,
  onPageChange,
  isLoading,
  filters,
}: DiscoverGridProps) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isEmpty = !isLoading && experiences.length === 0;

  if (isEmpty && !filters) {
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

      {filters && (
        // Sticks under the top bar. The bar is sticky only from md up, so on a
        // phone the filters stick to the top of the screen. 69px is the desktop
        // bar: 12px padding, the 44px tab row, and its 1px border.
        <div className="sticky top-0 z-40 bg-white/95 py-3 md:top-[69px]">{filters}</div>
      )}

      {isEmpty ? (
        <div className="flex justify-center py-8">
          <NoData message="No experiences in this category yet" />
        </div>
      ) : isLoading ? (
        <div className="grid grid-cols-[repeat(auto-fill,184px)] justify-start gap-x-4 gap-y-[26px]">
          {Array.from({ length: DISCOVER_GRID_PAGE_SIZE }).map((_, index) => (
            <div key={index} className="aspect-square animate-pulse rounded-xl bg-gray-200" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,184px)] justify-start gap-x-4 gap-y-[26px]">
          {experiences.map((experience) => (
            // The rails' card at the rails' width, so a tile here matches the
            // rails above it
            <ExperienceCard key={experience.id} experience={experience} />
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
