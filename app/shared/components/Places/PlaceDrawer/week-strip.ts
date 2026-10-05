import { Experience } from '@/types/experience';

export type StripDay = {
  /** YYYY-MM-DD, in the reader's own timezone */
  key: string;
  date: Date;
  /** "Sun" */
  weekday: string;
  /** "4" */
  dayOfMonth: string;
  /** Already gone: nothing can be booked on it */
  isPast: boolean;
  /** Something is on, so the pill carries a dot */
  hasExperiences: boolean;
};

/** YYYY-MM-DD for a Date, read locally rather than as UTC. */
export const dayKey = (date: Date): string => {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
};

const atMidnight = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

/** The Sunday on or before a date — where the strip starts. */
export const weekStart = (date: Date): Date => {
  const start = atMidnight(date);
  start.setDate(start.getDate() - start.getDay());
  return start;
};

export const addWeeks = (date: Date, weeks: number): Date => {
  const moved = new Date(date);
  moved.setDate(moved.getDate() + weeks * 7);
  return moved;
};

/** What an experience is filed under: the day it starts, locally. */
export const experienceDayKey = (experience: Experience): string | null => {
  const start = new Date(experience.startDate);
  return Number.isNaN(start.getTime()) ? null : dayKey(start);
};

/** The experiences starting on one day, soonest first. */
export const experiencesOnDay = (experiences: Experience[], key: string): Experience[] =>
  experiences
    .filter((experience) => experienceDayKey(experience) === key)
    .sort(
      (left, right) => new Date(left.startDate).getTime() - new Date(right.startDate).getTime(),
    );

/**
 * The seven pills for one week.
 *
 * ⚠️ Only one-off experiences land on a day. A recurring one is filed under
 * the date its SERIES began, which is often months back — placing it on every
 * date it runs would mean reading its rule for each of the seven, and the list
 * endpoint returns no occurrences to read instead.
 */
export const buildWeek = (
  start: Date,
  experiences: Experience[],
  now: Date = new Date(),
): StripDay[] => {
  const todayKey = dayKey(now);

  const busy = new Set(
    experiences.map(experienceDayKey).filter((key): key is string => key !== null),
  );

  return Array.from({ length: 7 }, (_, offset) => {
    const date = new Date(start);
    date.setDate(date.getDate() + offset);
    const key = dayKey(date);

    return {
      key,
      date,
      weekday: date.toLocaleDateString('en-GB', { weekday: 'short' }),
      dayOfMonth: String(date.getDate()),
      isPast: key < todayKey,
      hasExperiences: busy.has(key),
    };
  });
};

/** "October 2026" — the month the shown week belongs to. */
export const monthLabel = (week: StripDay[]): string => {
  // A week spanning two months is named for the one holding most of it, which
  // is the month of its middle day
  const middle = week[3]?.date ?? week[0]?.date;
  return middle ? middle.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }) : '';
};
