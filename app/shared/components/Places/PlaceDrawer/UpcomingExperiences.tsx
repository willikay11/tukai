'use client';

import { useMemo, useState } from 'react';

import { ExperienceCard } from '@/app/(experiences)/components/ExperienceCard';
import { useExperiences } from '@/app/shared/hooks/useExperiences';
import { Experience } from '@/types/experience';

import { WeekStrip } from './WeekStrip';
import {
  addWeeks,
  buildWeek,
  dayKey,
  dayLabel,
  experiencesOnDay,
  isCurrentWeek,
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

      <WeekStrip
        anchor={anchor}
        week={week}
        selectedKey={selectedKey}
        dotsFor={(day) => Math.min(day.experienceCount, MAX_DAY_DOTS)}
        onSelect={setSelectedKey}
        onMove={moveTo}
      />

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
