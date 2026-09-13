import moment from 'moment';
import { RRule } from 'rrule';

const DAY_ABBREV: Record<string, string> = {
  MO: 'Mon',
  TU: 'Tue',
  WE: 'Wed',
  TH: 'Thu',
  FR: 'Fri',
  SA: 'Sat',
  SU: 'Sun',
  monday: 'Mon',
  tuesday: 'Tue',
  wednesday: 'Wed',
  thursday: 'Thu',
  friday: 'Fri',
  saturday: 'Sat',
  sunday: 'Sun',
  mon: 'Mon',
  tue: 'Tue',
  wed: 'Wed',
  thu: 'Thu',
  fri: 'Fri',
  sat: 'Sat',
  sun: 'Sun',
};

const DAY_FULL: Record<string, string> = {
  MO: 'Monday',
  TU: 'Tuesday',
  WE: 'Wednesday',
  TH: 'Thursday',
  FR: 'Friday',
  SA: 'Saturday',
  SU: 'Sunday',
  mon: 'Monday',
  tue: 'Tuesday',
  wed: 'Wednesday',
  thu: 'Thursday',
  fri: 'Friday',
  sat: 'Saturday',
  sun: 'Sunday',
};

// JS weekday numbers, as returned by moment().day() — 0 = Sunday
const DAY_INDEX: Record<string, number> = {
  sun: 0,
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6,
  SU: 0,
  MO: 1,
  TU: 2,
  WE: 3,
  TH: 4,
  FR: 5,
  SA: 6,
};

const joinDayNames = (names: string[]): string => {
  if (names.length === 0) return '';
  if (names.length === 1) return names[0];
  const last = names[names.length - 1];
  return `${names.slice(0, -1).join(', ')} & ${last}`;
};

/** "Mon, Wed & Fri" — the compact form used in the create flow's step 1 */
export const formatDayLabel = (days: string[]): string =>
  joinDayNames(days.map((day) => DAY_ABBREV[day] ?? day));

/**
 * "Monday, Wednesday & Friday" — the form the customer sees on the booking
 * panel. Unknown values pass through, so full names can be handed in as-is.
 */
export const formatFullDayLabel = (days: string[]): string =>
  joinDayNames(days.map((day) => DAY_FULL[day] ?? day));

/** JS weekday number (0 = Sunday) for a day key, or null when unrecognised */
export const toWeekdayIndex = (day: string): number | null => DAY_INDEX[day] ?? null;

// RRule weekday numbers run 0 = Monday … 6 = Sunday, unlike JS/moment's 0 = Sunday
const RRULE_DAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

/**
 * Pulls the day keys and date range back out of an RRULE string, in the shape
 * the create flow and the previews use. Returns null for an unparseable rule.
 */
export const parseRecurrenceRule = (
  recurrenceRule: string,
): { days: string[]; startDate: string | null; endDate: string | null } | null => {
  try {
    const rule = new RRule(RRule.parseString(recurrenceRule));
    const byweekday = (rule.options.byweekday ?? []) as number[];

    // RRule stores these as UTC instants. Read them back in UTC too — an
    // end-of-day UNTIL would otherwise roll into the next date east of GMT.
    return {
      days: byweekday.map((day) => RRULE_DAY_KEYS[day]).filter(Boolean),
      startDate: rule.options.dtstart
        ? moment.utc(rule.options.dtstart).format('YYYY-MM-DD')
        : null,
      endDate: rule.options.until ? moment.utc(rule.options.until).format('YYYY-MM-DD') : null,
    };
  } catch {
    return null;
  }
};
