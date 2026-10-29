import moment from 'moment';

/** Days between a date and today, ignoring time of day. Negative is past. */
export const dayOffsetOf = (date: string | Date, now: Date = new Date()): number =>
  moment(date).startOf('day').diff(moment(now).startOf('day'), 'days');

export const dateFromOffset = (offset: number, now: Date = new Date()): Date =>
  moment(now).startOf('day').add(offset, 'days').toDate();

/** The next offset that is today or later, else the latest past one. */
export const defaultDayOffset = (offsets: number[]): number => {
  const upcoming = offsets.find((offset) => offset >= 0);
  if (upcoming !== undefined) return upcoming;

  return offsets.length ? offsets[offsets.length - 1] : 0;
};
