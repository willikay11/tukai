import moment, { Moment } from 'moment';

/**
 * The API stores and serves every datetime in UTC, and slot templates'
 * `start_time` too. An experience also carries `timezone` (IANA, e.g.
 * `Africa/Nairobi`): the zone where it happens, which its dates are shown in
 * and its form is filled in.
 *
 * Every helper takes that zone as an optional last argument. Without one (or
 * with a name the browser doesn't know) it uses the browser's own zone, which
 * is what the app did before experiences had one.
 *
 * Built on Intl, which knows every IANA zone, so the app ships no time zone
 * data of its own.
 */

const DATE_TIME = 'YYYY-MM-DDTHH:mm:ss';

/** The browser's IANA zone, the default for a new experience. */
export const browserTimeZone = (): string => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Africa/Nairobi';
  } catch {
    return 'Africa/Nairobi';
  }
};

/** Whether `timeZone` is an IANA zone the browser can convert to. */
export const isTimeZone = (timeZone?: string | null): timeZone is string => {
  if (!timeZone) return false;
  try {
    new Intl.DateTimeFormat('en-US', { timeZone });
    return true;
  } catch {
    return false;
  }
};

/** The wall-clock reading of `instant` in `timeZone`. */
const wallClock = (instant: Date, timeZone: string) => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(instant);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((p) => p.type === type)?.value ?? 0);

  return {
    year: part('year'),
    month: part('month') - 1,
    day: part('day'),
    hour: part('hour') % 24,
    minute: part('minute'),
    second: part('second'),
  };
};

/** How far ahead of UTC `timeZone` is at `instant`, in milliseconds. */
const offsetAt = (instant: Date, timeZone: string): number => {
  const wall = wallClock(instant, timeZone);
  const wallAsUtc = Date.UTC(wall.year, wall.month, wall.day, wall.hour, wall.minute, wall.second);
  return wallAsUtc - (instant.getTime() - instant.getMilliseconds());
};

/**
 * A wall-clock date and time (`YYYY-MM-DDTHH:mm:ss`) in `timeZone` as a
 * moment in UTC. Two passes settle the offset across a daylight-saving change.
 */
const wallToUtc = (wall: string, timeZone?: string | null): Moment => {
  if (!isTimeZone(timeZone)) return moment(wall, DATE_TIME).utc();

  const asUtc = moment.utc(wall, DATE_TIME).valueOf();
  let instant = asUtc - offsetAt(new Date(asUtc), timeZone);
  instant = asUtc - offsetAt(new Date(instant), timeZone);
  return moment.utc(instant);
};

/**
 * `date` shifted so that its local getters (and `moment(date).format(...)`)
 * read the wall clock in `timeZone`. For display only: the shifted Date is a
 * different instant, so never send it or compare it with real ones.
 */
export const shiftToZone = (date: Date, timeZone?: string | null): Date => {
  if (!isTimeZone(timeZone) || Number.isNaN(date.getTime())) return date;
  const wall = wallClock(date, timeZone);
  return new Date(
    wall.year,
    wall.month,
    wall.day,
    wall.hour,
    wall.minute,
    wall.second,
    date.getMilliseconds(),
  );
};

/**
 * An API datetime as a moment that formats in `timeZone`, e.g.
 * `experienceMoment(experience.startDate, experience.timezone).format('h:mm A')`.
 * For display only, as with {@link shiftToZone}.
 */
export const experienceMoment = (iso: string, timeZone?: string | null): Moment =>
  moment(shiftToZone(new Date(iso), timeZone));

/**
 * A local date and time as a UTC ISO instant, e.g. `2026-07-05` + `08:00` in
 * Nairobi -> `2026-07-05T05:00:00Z`. With no time, the start of the day, or
 * its last second when `endOfDay` is set.
 */
export const localDateTimeToUtcIso = (
  date: string,
  time: string | null = null,
  endOfDay = false,
  timeZone?: string | null,
): string => {
  if (!date) return '';
  const clock = time ? `${time.substring(0, 5)}:00` : endOfDay ? '23:59:59' : '00:00:00';
  return wallToUtc(`${date}T${clock}`, timeZone).format('YYYY-MM-DDTHH:mm:ss[Z]');
};

/**
 * An API datetime as the local date and time the form shows, e.g.
 * `2026-07-04T22:30:00Z` in Nairobi -> `{ date: '2026-07-05', time: '01:30' }`.
 */
export const utcIsoToLocalParts = (
  iso: string | null | undefined,
  timeZone?: string | null,
): { date: string | null; time: string | null } => {
  if (!iso || Number.isNaN(new Date(iso).getTime())) return { date: null, time: null };
  const local = experienceMoment(iso, timeZone);
  return { date: local.format('YYYY-MM-DD'), time: local.format('HH:mm') };
};

/**
 * A slot's local start time as the UTC `HH:mm` the API stores, worked out on
 * the experience's first day (a local date). The day matters: 01:30 in
 * Nairobi is 22:30 UTC the day before.
 */
export const localTimeToUtcTime = (
  localDate: string,
  time: string,
  timeZone?: string | null,
): string => wallToUtc(`${localDate}T${time.substring(0, 5)}:00`, timeZone).format('HH:mm');

/**
 * A slot's UTC `start_time` as the local `HH:mm` the form shows. `utcDate` is
 * the UTC date of the experience's start: the backend places every slot on
 * that day, so it is the day to convert on.
 */
export const utcTimeToLocalTime = (
  utcDate: string,
  utcTime: string,
  timeZone?: string | null,
): string =>
  experienceMoment(`${utcDate}T${utcTime.substring(0, 5)}:00Z`, timeZone).format('HH:mm');

/** The UTC calendar date of an API datetime, e.g. `2026-07-04T22:30:00Z` -> `2026-07-04`. */
export const utcDateOf = (iso: string): string => moment.utc(iso).format('YYYY-MM-DD');
