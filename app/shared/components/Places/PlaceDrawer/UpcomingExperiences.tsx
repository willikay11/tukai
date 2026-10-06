'use client';

import { useMemo, useState } from 'react';

import { ExperienceCard } from '@/app/(experiences)/components/ExperienceCard';
import { IconComponent } from '@/app/shared/components/Icons';
import { useExperiences } from '@/app/shared/hooks/useExperiences';
import { cn } from '@/lib/utils';
import { Experience } from '@/types/experience';

import {
  StripDay,
  addWeeks,
  buildWeek,
  dayKey,
  dayLabel,
  experiencesOnDay,
  isCurrentWeek,
  isLastWeek,
  weekLabel,
  weekStart,
} from './week-strip';

/**
 * Wide enough that a place's whole programme lands in one request. Exported so
 * the drawer asks for the same page: React Query shares the response only when
 * the query keys match.
 */
export const UPCOMING_PAGE_SIZE = 50;

/**
 * One dot per experience, up to this many. Past it the pill would grow past the
 * design's 44px height, and the count is already in the cards below.
 */
const MAX_DAY_DOTS = 3;

const PagerArrow = ({
  direction,
  label,
  disabled,
  onClick,
}: {
  direction: 'back' | 'next';
  label: string;
  disabled?: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    aria-label={label}
    className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-brand-ink transition-colors hover:bg-surface disabled:cursor-default disabled:opacity-40 disabled:hover:bg-transparent"
  >
    <IconComponent
      iconName={direction === 'back' ? 'ArrowLeft01Icon' : 'ArrowRight01Icon'}
      size={20}
      color="currentColor"
    />
  </button>
);

const DayPill = ({
  day,
  isSelected,
  onSelect,
}: {
  day: StripDay;
  isSelected: boolean;
  onSelect: () => void;
}) => {
  const dots = Math.min(day.experienceCount, MAX_DAY_DOTS);

  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={day.isPast}
      aria-pressed={isSelected}
      className={cn(
        'inline-flex h-11 flex-shrink-0 items-center gap-[5px] rounded-full border px-3.5 text-[14.5px] transition-colors',
        day.isPast
          ? 'cursor-default border-transparent bg-surface text-ink-subtle'
          : isSelected
            ? 'border-transparent bg-green-200 text-brand'
            : 'border-line bg-white text-brand-ink hover:bg-surface',
        isSelected && 'font-semibold',
      )}
    >
      <span>{day.weekday}</span>
      <span className="font-bold">{day.dayOfMonth}</span>
      {/* A dot rather than a count: the number is in the cards below */}
      {dots > 0 && !day.isPast && (
        <span aria-hidden className="ml-0.5 flex items-center gap-[3px]">
          {Array.from({ length: dots }, (_, index) => (
            <span
              key={index}
              className={cn(
                'h-[5px] w-[5px] rounded-full',
                isSelected ? 'bg-brand' : 'bg-lime-dark',
              )}
            />
          ))}
        </span>
      )}
    </button>
  );
};

/**
 * What is on at a place, a week at a time.
 *
 * ⚠️ `GET /experiences/?place=` is the only query the API offers here - there
 * is no per-day or per-month endpoint, and no date range - so one wide page is
 * read and the week strip is built from it. A place running more than 50
 * experiences would lose the tail.
 */
export const UpcomingExperiences = ({
  placeId,
  placeTitle,
}: {
  placeId: string;
  placeTitle: string;
}) => {
  const [anchor, setAnchor] = useState(() => weekStart(new Date()));
  const [selectedKey, setSelectedKey] = useState(() => dayKey(new Date()));

  const { data, isLoading } = useExperiences(
    { page: 1, page_size: UPCOMING_PAGE_SIZE, place: placeId, status: 'published' },
    Boolean(placeId),
  );
  const experiences: Experience[] = useMemo(() => data?.data?.results ?? [], [data]);

  const week = useMemo(() => buildWeek(anchor, experiences), [anchor, experiences]);
  const onSelectedDay = useMemo(
    () => experiencesOnDay(experiences, selectedKey),
    [experiences, selectedKey],
  );

  // Moving a week lands on its first day, or today when that is the week the
  // reader is in - a selection left behind would be off the strip entirely
  const moveTo = (weeks: number) => {
    const next = addWeeks(anchor, weeks);
    setAnchor(next);
    setSelectedKey(isCurrentWeek(next) ? dayKey(new Date()) : dayKey(next));
  };

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-[19px] font-bold tracking-[-0.2px] text-brand-ink">
          Upcoming experiences
        </h3>
        <p className="mt-1.5 text-sm leading-snug text-ink-muted">
          Upcoming experiences at {placeTitle}
        </p>
      </div>

      <div className="-ml-3 flex items-center gap-0.5">
        <PagerArrow
          direction="back"
          label="Previous week"
          disabled={isCurrentWeek(anchor)}
          onClick={() => moveTo(-1)}
        />
        <span aria-live="polite" className="text-[15.5px] font-semibold text-brand-ink">
          {weekLabel(week)}
        </span>
        <PagerArrow
          direction="next"
          label="Next week"
          disabled={isLastWeek(anchor)}
          onClick={() => moveTo(1)}
        />
      </div>

      <div className="flex gap-2 overflow-x-auto scrollbar-hide">
        {week.map((day) => (
          <DayPill
            key={day.key}
            day={day}
            isSelected={day.key === selectedKey}
            onSelect={() => setSelectedKey(day.key)}
          />
        ))}
      </div>

      {isLoading ? (
        <div className="aspect-square w-[184px] animate-pulse rounded-xl bg-gray-200" />
      ) : onSelectedDay.length > 0 ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-x-3.5 gap-y-[22px] pt-1.5">
          {onSelectedDay.map((experience) => (
            // Stays a link: a drawer opened from here would stack on the place
            // drawer, which cannot yet be closed back to in order (see D-10)
            <ExperienceCard
              key={experience.id}
              experience={experience}
              opensDrawer={false}
              className="w-full"
            />
          ))}
        </div>
      ) : (
        <p className="pt-1 text-sm leading-snug text-ink-muted">
          Nothing on at {placeTitle} on {dayLabel(selectedKey)}. Try another day.
        </p>
      )}
    </div>
  );
};
