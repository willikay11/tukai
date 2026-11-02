'use client';

import { ReactNode, Ref } from 'react';

import { BucketList } from '@/types/bucket-list';

import { BucketListTile } from './BucketListTile';
import { BucketListTileMode } from './BucketListTile/bucket-list-tile';

// Up to four columns, never narrower than 190px: four at a 1312px content
// width, two at 600px, one on a phone
const GRID =
  'mt-5 grid grid-cols-[repeat(auto-fill,minmax(max(190px,calc((100%-60px)/4)),1fr))] items-start gap-x-5 gap-y-6';

export const BucketListSection = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className="mt-7 flex min-w-0 flex-col">
    <h2 className="text-22 font-bold tracking-[-0.3px] text-brand-ink">{title}</h2>
    {children}
  </section>
);

export const BucketListGridSkeleton = ({ count = 8 }: { count?: number }) => (
  <div className={GRID} role="status" aria-label="Loading bucket lists">
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className="flex gap-2.5">
        <div className="h-[62px] w-[62px] flex-shrink-0 animate-pulse rounded-xl bg-surface" />
        <div className="flex flex-1 flex-col gap-2 pt-1">
          <div className="h-3.5 w-4/5 animate-pulse rounded bg-surface" />
          <div className="h-3 w-1/2 animate-pulse rounded bg-surface" />
          <div className="h-3 w-2/5 animate-pulse rounded bg-surface" />
        </div>
      </div>
    ))}
  </div>
);

export const BucketListGrid = ({
  bucketLists,
  mode,
  tileRef,
}: {
  bucketLists: BucketList[];
  mode: BucketListTileMode;
  /** Each card's button by its place in the grid, for moving focus to it. */
  tileRef?: (index: number) => Ref<HTMLButtonElement>;
}) => (
  <ul className={GRID}>
    {bucketLists.map((bucketList, index) => (
      <li key={bucketList.id} className="min-w-0">
        <BucketListTile ref={tileRef?.(index)} bucketList={bucketList} mode={mode} />
      </li>
    ))}
  </ul>
);
