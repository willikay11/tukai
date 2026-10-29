'use client';

import { useLayoutEffect, useRef } from 'react';

import { cn } from '@/lib/utils';

export interface DateRailDay {
  offset: number;
  date: Date;
  isPast: boolean;
  /** How many items fall on this day - carried only for the pill's aria-label. */
  count?: number;
}

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

/** Centres a pill in its rail - never scrolls past the start. */
const centre = (rail: HTMLDivElement, pill: HTMLElement, smooth: boolean) => {
  const target = Math.max(
    0,
    pill.offsetLeft - rail.offsetLeft - (rail.clientWidth - pill.offsetWidth) / 2,
  );
  rail.scrollTo({ left: target, behavior: smooth ? 'smooth' : 'auto' });
};

/**
 * The Dashboard's horizontal day rail - one pill per date that has something,
 * the selected pill always centred. Unlike the Profile calendar's prev/next
 * arrows, this scrolls and self-centres: instantly on mount, smoothly on a
 * later pick (mirrors the design reference's `centre()`/`_ccRailRef`).
 */
export const DateRail = ({
  days,
  selectedOffset,
  onSelect,
  ariaLabel,
}: {
  days: DateRailDay[];
  selectedOffset: number | null;
  onSelect: (offset: number) => void;
  ariaLabel: (day: DateRailDay) => string;
}) => {
  const railRef = useRef<HTMLDivElement>(null);
  const hasCentredOnce = useRef(false);

  useLayoutEffect(() => {
    const rail = railRef.current;
    const pill = rail?.querySelector<HTMLElement>('[aria-pressed="true"]');
    if (!rail || !pill) return;

    centre(rail, pill, hasCentredOnce.current);
    hasCentredOnce.current = true;
  }, [selectedOffset]);

  return (
    <div ref={railRef} className="scrollbar-hide flex gap-2 overflow-x-auto px-0.5">
      {days.map((day) => {
        const selected = day.offset === selectedOffset;

        return (
          <button
            key={day.offset}
            type="button"
            onClick={() => onSelect(day.offset)}
            aria-pressed={selected}
            aria-label={ariaLabel(day)}
            className="flex h-12 flex-shrink-0 items-center hover:brightness-[.97]"
          >
            <span
              className={cn(
                'inline-flex h-[42px] items-center gap-[5px] whitespace-nowrap rounded-full border px-[17px] text-[15px]',
                selected && !day.isPast && 'border-surface-pill-active bg-surface-pill-active',
                selected && day.isPast && 'border-line bg-line',
                !selected && !day.isPast && 'border-line-soft bg-white',
                !selected && day.isPast && 'border-line bg-surface-muted',
              )}
            >
              <span
                className={cn(
                  selected
                    ? day.isPast
                      ? 'text-ink-note'
                      : 'text-brand-deep'
                    : day.isPast
                      ? 'text-ink-subtle'
                      : 'text-ink-muted',
                )}
              >
                {MONTHS[day.date.getMonth()]}
              </span>
              <span
                className={cn(
                  'font-bold',
                  selected
                    ? day.isPast
                      ? 'text-gray-900'
                      : 'text-brand-deep'
                    : day.isPast
                      ? 'text-ink-subtle'
                      : 'text-ink-pill',
                )}
              >
                {day.date.getDate()}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
};
