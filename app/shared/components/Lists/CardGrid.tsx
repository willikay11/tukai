'use client';

import { ReactNode } from 'react';

import { SectionHeader } from '@/app/(experiences)/experiences/components/SectionHeader';

import { usePagedItems } from './usePagedItems';

/**
 * A section heading over a grid the heading's arrows page.
 *
 * The canvas lays some sections out as a rail you scroll and others as a grid
 * that fills the row and pages — same header, different body. This is the
 * grid half; {@link CardRail} is the other.
 */
export const CardGrid = <T,>({
  title,
  subtitle,
  items,
  pageSize,
  getKey,
  renderItem,
  emptyLine,
}: {
  title: string;
  subtitle?: string;
  items: T[];
  /** How many fill one page. The canvas shows five. */
  pageSize: number;
  getKey: (item: T) => string;
  renderItem: (item: T, index: number) => ReactNode;
  /** Said in place of the grid when there is nothing to show. */
  emptyLine?: string;
}) => {
  const paged = usePagedItems(items, pageSize);

  return (
    <section>
      <SectionHeader
        title={title}
        subtitle={subtitle}
        railLabel={title.toLowerCase()}
        onBack={paged.onBack}
        onNext={paged.onNext}
        atStart={paged.atStart}
        atEnd={paged.atEnd}
      />

      {items.length === 0 && emptyLine ? (
        <p className="rounded-xl bg-surface px-5 py-[18px] text-sm text-ink-muted">{emptyLine}</p>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(168px,1fr))] gap-4">
          {paged.items.map((item, index) => (
            <div key={getKey(item)}>{renderItem(item, index)}</div>
          ))}
        </div>
      )}
    </section>
  );
};
