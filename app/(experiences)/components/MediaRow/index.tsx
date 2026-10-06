'use client';

import { ReactNode } from 'react';

import Link from 'next/link';

import { PhotoImage } from '@/app/shared/components/Images';
import { MEDIA_ZOOM, TITLE_TINT } from '@/app/shared/components/Motion';
import { cn } from '@/lib/utils';

/**
 * The grid the Discover list sections fill: four across on a wide screen, two
 * rows of them, dropping to two and then one as it narrows.
 */
export const ROW_GRID = 'grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2 xl:grid-cols-4';

/**
 * A thumbnail beside a title and a line or two beneath it.
 *
 * Communities and bucket lists are drawn identically on Discover - the same
 * 72px tile, the same stacked body - and differ only in what the body says, so
 * the shape lives here and each section supplies its own lines.
 */
export const MediaRow = ({
  href,
  photo,
  title,
  priority = false,
  children,
}: {
  href: string;
  photo: string | null | undefined;
  title: string;
  priority?: boolean;
  /** The lines under the title. */
  children: ReactNode;
}) => (
  <Link href={href} className="group flex min-w-0 items-start gap-4">
    <span className="relative block h-[72px] w-[72px] flex-shrink-0 overflow-hidden rounded-xl bg-surface">
      <PhotoImage
        src={photo}
        alt={title}
        fill
        sizes="72px"
        priority={priority}
        className={cn('object-cover', MEDIA_ZOOM)}
      />
    </span>

    <span className="flex min-w-0 flex-col gap-1.5 pt-0.5">
      <span className={cn('truncate text-[17px] font-bold text-brand-ink', TITLE_TINT)}>
        {title}
      </span>
      {children}
    </span>
  </Link>
);

/** Eight rows' worth of grey, in the grid the real rows will fill. */
export const RowGridSkeleton = ({
  rows = 8,
  gridClassName = ROW_GRID,
}: {
  rows?: number;
  /** Matches the grid the rows will load into, so the layout does not jump. */
  gridClassName?: string;
}) => (
  <div className={gridClassName}>
    {Array.from({ length: rows }).map((_, index) => (
      <div key={index} className="flex items-start gap-4">
        <div className="h-[72px] w-[72px] flex-shrink-0 animate-pulse rounded-xl bg-gray-200" />
        <div className="flex min-w-0 flex-1 flex-col gap-2 pt-1">
          <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
          <div className="h-3 w-1/2 animate-pulse rounded bg-gray-200" />
        </div>
      </div>
    ))}
  </div>
);
