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
  experiencesOnDay,
  monthLabel,
  weekStart,
} from './week-strip';

/** Wide enough that a place's whole programme lands in one request. */
const PAGE_SIZE = 50;

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
    className={cn(
      'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full transition-colors',
      disabled ? 'cursor-default text-ink-subtle' : 'text-brand-ink hover:bg-surface',
    )}
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
}) => (
  <button
    type="button"
    onClick={onSelect}
    disabled={day.isPast}
    aria-pressed={isSelected}
    className={cn(
      'inline-flex flex-shrink-0 items-center gap-1.5 rounded-full border px-4 py-2.5 text-[15px] transition-colors',
      day.isPast
        ? 'cursor-default border-transparent bg-surface text-ink-subtle'
        : isSelected
          ? 'border-transparent bg-green-200 font-semibold text-brand'
          : 'border-line bg-white text-brand-ink hover:bg-surface',
    )}
  >
    <span>{day.weekday}</span>
    <span className="font-bold">{day.dayOfMonth}</span>
    {/* A dot rather than a count: the number is in the cards below */}
    {day.hasExperiences && !day.isPast && (
      <span
        aria-hidden
        className={cn('h-1.5 w-1.5 rounded-full', isSelected ? 'bg-brand' : 'bg-lime-dark')}
      />
    )}
  </button>
);

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
    { page: 1, page_size: PAGE_SIZE, place: placeId, status: 'published' },
    Boolean(placeId),
  );
  const experiences: Experience[] = useMemo(() => data?.data?.results ?? [], [data]);

  const week = useMemo(() => buildWeek(anchor, experiences), [anchor, experiences]);
  const onSelectedDay = useMemo(
    () => experiencesOnDay(experiences, selectedKey),
    [experiences, selectedKey],
  );

  // Nothing to page back to before the week the reader is standing in
  const isCurrentWeek = dayKey(anchor) === dayKey(weekStart(new Date()));

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-[22px] font-bold text-brand-ink">Upcoming experiences</h3>
        <p className="mt-1 text-[15px] text-ink-muted">Upcoming experiences at {placeTitle}</p>
      </div>

      <div className="flex items-center gap-2">
        <PagerArrow
          direction="back"
          label="Previous week"
          disabled={isCurrentWeek}
          onClick={() => setAnchor((current) => addWeeks(current, -1))}
        />
        <span className="min-w-[150px] text-[17px] font-bold text-brand-ink">
          {monthLabel(week)}
        </span>
        <PagerArrow
          direction="next"
          label="Next week"
          onClick={() => setAnchor((current) => addWeeks(current, 1))}
        />
      </div>

      <div className="flex gap-2.5 overflow-x-auto scrollbar-hide">
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
        <div className="flex flex-wrap gap-4">
          {onSelectedDay.map((experience) => (
            // Stays a link: a drawer opened from here would stack on the place
            // drawer, which cannot yet be closed back to in order (see D-10)
            <ExperienceCard key={experience.id} experience={experience} opensDrawer={false} />
          ))}
        </div>
      ) : (
        <p className="rounded-xl bg-surface px-5 py-[18px] text-[15px] text-ink-muted">
          Nothing on at {placeTitle} that day.
        </p>
      )}
    </div>
  );
};
