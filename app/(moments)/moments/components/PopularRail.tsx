'use client';

import { useState } from 'react';

import { SectionHeader } from '@/app/(experiences)/experiences/components/SectionHeader';
import { IconComponent } from '@/app/shared/components/Icons';
import { PhotoImage } from '@/app/shared/components/Images';
import { cn } from '@/lib/utils';

import { PopularItem, PopularRail as PopularRailData } from '../hooks/usePopularRails';

/** Items on a page of the rail; the header's arrows step through the rest. */
export const POPULAR_PAGE_SIZE = 8;

const GRID =
  'mt-0.5 grid grid-cols-[repeat(auto-fill,minmax(min(100%,280px),1fr))] gap-x-4 gap-y-3';

const META_TONE: Record<NonNullable<PopularItem['meta']>['tone'], string> = {
  ink: 'text-ink-summary',
  brand: 'text-brand',
  muted: 'text-ink-muted',
};

const Item = ({ item }: { item: PopularItem }) => (
  <button
    type="button"
    onClick={item.onOpen}
    className="flex min-w-0 items-center gap-3.5 rounded-xl bg-white py-2.5 pl-2.5 pr-3.5 text-left transition-shadow hover:shadow-[0_8px_24px_rgba(1,51,52,.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 active:scale-[0.99]"
  >
    <span className="relative block h-[72px] w-[72px] flex-shrink-0 overflow-hidden rounded-lg bg-surface">
      <PhotoImage src={item.photo} alt="" fill sizes="72px" className="object-cover" />
    </span>

    <span className="flex min-w-0 flex-1 flex-col gap-[3px]">
      <span className="text-[14.5px] font-semibold leading-[1.3] text-brand-ink">{item.name}</span>
      {item.secondLine && (
        <span className="text-[12.5px] leading-[1.35] text-ink-muted">{item.secondLine}</span>
      )}
      {item.meta && (
        <span className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[12.5px] font-semibold">
          <span className={cn('inline-flex items-center gap-[5px]', META_TONE[item.meta.tone])}>
            <IconComponent
              iconName={item.meta.icon}
              size={14}
              color="currentColor"
              className="flex-shrink-0"
            />
            {item.meta.text}
          </span>
        </span>
      )}
    </span>
  </button>
);

const ItemSkeleton = () => (
  <div className="flex items-center gap-3.5 py-2.5 pl-2.5 pr-3.5">
    <div className="h-[72px] w-[72px] flex-shrink-0 animate-pulse rounded-lg bg-gray-200" />
    <div className="flex min-w-0 flex-1 flex-col gap-2">
      <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
      <div className="h-3 w-1/2 animate-pulse rounded bg-gray-200" />
    </div>
  </div>
);

/**
 * A popular rail between blocks of the Moments feed: a header, then a grid of
 * up to eight rows that the header's arrows page through. It spans the whole
 * feed grid it sits in.
 *
 * Draws nothing once loaded empty, so no heading shows alone. Each rail keeps
 * its own page.
 */
export const PopularRail = ({ rail }: { rail: PopularRailData }) => {
  const [page, setPage] = useState(0);

  const pageCount = Math.max(1, Math.ceil(rail.items.length / POPULAR_PAGE_SIZE));
  const current = Math.min(page, pageCount - 1);
  const shown = rail.items.slice(current * POPULAR_PAGE_SIZE, (current + 1) * POPULAR_PAGE_SIZE);
  const canPage = rail.items.length > POPULAR_PAGE_SIZE;

  if (!rail.isLoading && rail.items.length === 0) return null;

  return (
    <section aria-label={rail.title} className="col-span-full min-w-0 pb-3 pt-2.5">
      <SectionHeader
        title={rail.title}
        subtitle={rail.subtitle}
        railLabel={rail.noun}
        onBack={canPage ? () => setPage(Math.max(0, current - 1)) : undefined}
        onNext={canPage ? () => setPage(Math.min(pageCount - 1, current + 1)) : undefined}
        atStart={current === 0}
        atEnd={current >= pageCount - 1}
      />

      <div className={GRID}>
        {rail.isLoading
          ? Array.from({ length: 4 }, (_, index) => <ItemSkeleton key={index} />)
          : shown.map((item) => <Item key={item.id} item={item} />)}
      </div>
    </section>
  );
};
