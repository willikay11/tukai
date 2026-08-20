import { ReactNode } from 'react';

import { cn } from '@/lib/utils';

// The gutter every browse page shares: a 12-column grid whose content column
// narrows as the viewport widens. Previously this class string was pasted into
// each page, so pages drifted apart — Discover and Moments were on a plain
// max-w-7xl and did not line up with Experiences, Places or Communities.
export const PAGE_CONTENT_COLUMNS =
  'col-span-12 md:col-span-10 md:col-start-2 3xl:col-span-8 3xl:col-start-3 4xl:col-span-6 4xl:col-start-4';

export const PageContainer = ({
  children,
  className,
}: {
  children: ReactNode;
  // Applied to the content column, for per-page spacing
  className?: string;
}) => (
  <main className="grid grid-cols-12 gap-x-4 px-4 md:px-0">
    <div className={cn(PAGE_CONTENT_COLUMNS, className)}>{children}</div>
  </main>
);
