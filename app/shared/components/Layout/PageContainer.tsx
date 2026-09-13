import { ReactNode } from 'react';

import { cn } from '@/lib/utils';

// The gutter every browse page shares: a 12-column grid whose content column
// narrows as the viewport widens. Previously this class string was pasted into
// each page, so pages drifted apart — Discover and Moments were on a plain
// max-w-7xl and did not line up with Experiences, Places or Communities.
export const PAGE_CONTENT_COLUMNS =
  'col-span-12 md:col-span-10 md:col-start-2 3xl:col-span-8 3xl:col-start-3 4xl:col-span-6 4xl:col-start-4';

/**
 * One column narrower on each side than the browse gutter.
 *
 * Detail pages — a single experience, place or community — are reading pages
 * rather than grids of cards, so they sit inside the browse column with an
 * extra empty column either side.
 */
export const PAGE_DETAIL_COLUMNS =
  'col-span-12 md:col-span-8 md:col-start-3 3xl:col-span-6 3xl:col-start-4 4xl:col-span-4 4xl:col-start-5';

export const PageContainer = ({
  children,
  className,
  variant = 'browse',
}: {
  children: ReactNode;
  // Applied to the content column, for per-page spacing
  className?: string;
  variant?: 'browse' | 'detail';
}) => (
  <main className="grid grid-cols-12 gap-x-4 px-4 md:px-0">
    <div
      className={cn(variant === 'detail' ? PAGE_DETAIL_COLUMNS : PAGE_CONTENT_COLUMNS, className)}
    >
      {children}
    </div>
  </main>
);
