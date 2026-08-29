import moment from 'moment';

/**
 * The date maths behind the reservations calendar — shared by the experiences
 * reserved tab and a place's own reservations, which show the same month
 * stepper and day pills over different rows.
 *
 * Anything with a start date can be laid out: only `start` is read.
 */
export type CalendarItem = { start: string | null };

export const dayKey = (date: Date | string): string => moment(date).format('YYYY-MM-DD');

// Only the days that actually have bookings — an empty day pill is noise, and a
// full month of them buries the handful that matter
export const buildActiveDays = <T extends CalendarItem>(
  items: T[],
  monthCursor: moment.Moment,
): Date[] =>
  Array.from(
    new Set(
      items
        .filter((item) => item.start && moment(item.start).isSame(monthCursor, 'month'))
        .map((item) => dayKey(item.start!)),
    ),
  )
    .sort()
    .map((key) => moment(key).toDate());

export const groupByDay = <T extends CalendarItem>(items: T[]): Record<string, T[]> =>
  items.reduce<Record<string, T[]>>((accumulator, item) => {
    if (!item.start) return accumulator;
    const key = dayKey(item.start);
    accumulator[key] = [...(accumulator[key] ?? []), item];
    return accumulator;
  }, {});

/**
 * Which month the panel opens on.
 *
 * It used to open on the earliest item, which meant the oldest booking in the
 * user's history pinned the panel to a long-past month. The current month is
 * the useful default; the panel only jumps forward when there is nothing to
 * show now but something later on.
 */
export const initialMonthFor = <T extends CalendarItem>(
  items: T[],
  now: Date = new Date(),
): moment.Moment => {
  const thisMonth = moment(now).startOf('month');

  const starts = items
    .map((item) => item.start)
    .filter((start): start is string => Boolean(start))
    .sort();

  if (starts.some((start) => moment(start).isSame(thisMonth, 'month'))) return thisMonth;

  const nextWithItems = starts.find((start) => moment(start).isAfter(thisMonth, 'month'));
  return nextWithItems ? moment(nextWithItems).startOf('month') : thisMonth;
};

/** The key the "All" pill uses, meaning "every day this month". */
export const ALL_DAYS = 'all';
