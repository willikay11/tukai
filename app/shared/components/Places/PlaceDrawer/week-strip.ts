import { Experience } from '@/types/experience';

/** How far ahead the strip reads, counted from the current week. */
export const MAX_WEEKS_AHEAD = 12;

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
  /** How many are on, so the pill carries a dot for each */
  experienceCount: number;
};

/** YYYY-MM-DD for a Date, read locally rather than as UTC. */
export const dayKey = (date: Date): string => {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
};

/** The local midnight a YYYY-MM-DD key names. `new Date(key)` would read it as UTC. */
export const parseDayKey = (key: string): Date => {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const atMidnight = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

/** The Sunday on or before a date - where the strip starts. */
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

/** The week the strip is standing in is the one the reader is in. */
export const isCurrentWeek = (anchor: Date, now: Date = new Date()): boolean =>
  dayKey(anchor) === dayKey(weekStart(now));

/** The strip stops at MAX_WEEKS_AHEAD: the week after the last one is out of reach. */
export const isLastWeek = (anchor: Date, now: Date = new Date()): boolean =>
  dayKey(anchor) >= dayKey(addWeeks(weekStart(now), MAX_WEEKS_AHEAD));

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
 * the date its SERIES began, which is often months back - placing it on every
 * date it runs would mean reading its rule for each of the seven, and the list
 * endpoint returns no occurrences to read instead.
 */
export const buildWeek = (
  start: Date,
  experiences: Experience[],
  now: Date = new Date(),
): StripDay[] => {
  const todayKey = dayKey(now);

  const counts = new Map<string, number>();
  for (const experience of experiences) {
    const key = experienceDayKey(experience);
    if (key !== null) counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return Array.from({ length: 7 }, (_, offset) => {
    const date = new Date(start);
    date.setDate(date.getDate() + offset);
    const key = dayKey(date);
    const experienceCount = counts.get(key) ?? 0;

    return {
      key,
      date,
      weekday: date.toLocaleDateString('en-GB', { weekday: 'short' }),
      dayOfMonth: String(date.getDate()),
      isPast: key < todayKey,
      hasExperiences: experienceCount > 0,
      experienceCount,
    };
  });
};

// Fixed rather than from the locale: en-GB abbreviates September as "Sept"
const SHORT_MONTHS = [
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

/**
 * "October 2026" for a week inside one month, "Sep to Oct 2026" across two.
 * A week across a year end names both years: "Dec 2026 to Jan 2027".
 */
export const weekLabel = (week: StripDay[]): string => {
  const first = week[0]?.date;
  const last = week[week.length - 1]?.date;
  if (!first || !last) return '';

  const sameMonth =
    first.getMonth() === last.getMonth() && first.getFullYear() === last.getFullYear();
  if (sameMonth) return first.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

  const sameYear = first.getFullYear() === last.getFullYear();
  const from = `${SHORT_MONTHS[first.getMonth()]}${sameYear ? '' : ` ${first.getFullYear()}`}`;
  const to = `${SHORT_MONTHS[last.getMonth()]} ${last.getFullYear()}`;
  return `${from} to ${to}`;
};

/** "Sun 5 Jul" - how the empty day names itself. */
export const dayLabel = (key: string): string => {
  const day = parseDayKey(key);
  const weekday = day.toLocaleDateString('en-GB', { weekday: 'short' });
  return `${weekday} ${day.getDate()} ${SHORT_MONTHS[day.getMonth()]}`;
};
