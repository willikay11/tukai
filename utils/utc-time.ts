import moment from 'moment';

/**
 * The API stores and serves every datetime in UTC, and slot templates'
 * `start_time` too. The create flow's form works in the host's local time
 * (`YYYY-MM-DD` dates and `HH:mm` times), so these convert at the API
 * boundary only: local to UTC on save, UTC to local on load.
 *
 * "Local" is the browser's time zone, the same one every other screen uses
 * when it shows an experience's dates with `moment(...)`.
 */

/**
 * A local date and time as a UTC ISO instant, e.g. `2026-07-05` + `08:00` in
 * Nairobi -> `2026-07-05T05:00:00Z`. With no time, the start of the day, or
 * its last second when `endOfDay` is set.
 */
export const localDateTimeToUtcIso = (
  date: string,
  time: string | null = null,
  endOfDay = false,
): string => {
  if (!date) return '';
  const clock = time ?? (endOfDay ? '23:59:59' : '00:00:00');
  return moment(`${date}T${clock}`).utc().format('YYYY-MM-DDTHH:mm:ss[Z]');
};

/**
 * An API datetime as the local date and time the form shows, e.g.
 * `2026-07-04T22:30:00Z` in Nairobi -> `{ date: '2026-07-05', time: '01:30' }`.
 */
export const utcIsoToLocalParts = (
  iso: string | null | undefined,
): { date: string | null; time: string | null } => {
  if (!iso) return { date: null, time: null };
  const local = moment(iso);
  if (!local.isValid()) return { date: null, time: null };
  return { date: local.format('YYYY-MM-DD'), time: local.format('HH:mm') };
};

/**
 * A slot's local start time as the UTC `HH:mm` the API stores, worked out on
 * the experience's first day (a local date). The day matters: 01:30 in
 * Nairobi is 22:30 UTC the day before.
 */
export const localTimeToUtcTime = (localDate: string, time: string): string =>
  moment(`${localDate}T${time}`).utc().format('HH:mm');

/**
 * A slot's UTC `start_time` as the local `HH:mm` the form shows. `utcDate` is
 * the UTC date of the experience's start: the backend places every slot on
 * that day, so it is the day to convert on.
 */
export const utcTimeToLocalTime = (utcDate: string, utcTime: string): string =>
  moment
    .utc(`${utcDate}T${utcTime.substring(0, 5)}`)
    .local()
    .format('HH:mm');

/** The UTC calendar date of an API datetime, e.g. `2026-07-04T22:30:00Z` -> `2026-07-04`. */
export const utcDateOf = (iso: string): string => moment.utc(iso).format('YYYY-MM-DD');
