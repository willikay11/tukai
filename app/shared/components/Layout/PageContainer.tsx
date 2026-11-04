import { ReactNode } from 'react';

import { cn } from '@/lib/utils';

/**
 * The page edge every screen shares, per the mobile handoff: a 1360px column,
 * centred, with a 24px edge at every width - so content is up to 1312px wide,
 * and lines up with the top bar and the footer above and below it.
 *
 * It keeps a 12-column grid inside, for pages that place a narrower column.
 * Pages that draw their own `<main>` use this string for the same edge.
 */
export const PAGE_GRID = 'mx-auto grid w-full max-w-[1360px] grid-cols-12 gap-x-4 px-6';

/** The browse column: the whole content width. */
export const PAGE_CONTENT_COLUMNS = 'col-span-12';

/**
 * Two columns in from each side.
 *
 * Detail pages - a single experience, place or community - are reading pages
 * rather than grids of cards, so they take a narrower column than the browse
 * pages, from the width a tablet gives them.
 */
export const PAGE_DETAIL_COLUMNS = 'col-span-12 md:col-span-8 md:col-start-3';

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
  <main className={PAGE_GRID}>
    <div
      className={cn(variant === 'detail' ? PAGE_DETAIL_COLUMNS : PAGE_CONTENT_COLUMNS, className)}
    >
      {children}
    </div>
  </main>
);
