import { PlaceAvailabilityException, PlaceAvailabilityRule } from '@/types/placeReservation';

const MINUTES_PER_HOUR = 60;
const DEFAULT_SLOT_MINUTES = 30;

/** "18:30" or "18:30:00" → minutes since midnight. */
const toMinutes = (time: string): number | null => {
  const [hours, minutes] = time.split(':').map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
  return hours * MINUTES_PER_HOUR + minutes;
};

const toTimeLabel = (minutes: number): string => {
  const hours = Math.floor(minutes / MINUTES_PER_HOUR);
  const rest = minutes % MINUTES_PER_HOUR;
  return `${String(hours).padStart(2, '0')}:${String(rest).padStart(2, '0')}`;
};

// The API numbers days 0=Monday..6=Sunday; JavaScript's getDay() is
// 0=Sunday..6=Saturday. Getting this wrong silently offers Sunday's hours on a
// Monday, so it is converted in one place.
export const apiDayOfWeek = (date: Date): number => (date.getDay() + 6) % 7;

const asIsoDate = (date: Date): string => {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
};

/**
 * The bookable times for one date.
 *
 * Weekly rules set the normal hours; an exception for that date overrides them
 * — either closing the day outright or replacing its open/close times. The last
 * slot starts a full interval before closing, so a booking never lands on the
 * moment the venue shuts.
 */
export const slotsForDate = (
  date: Date,
  rules: PlaceAvailabilityRule[],
  exceptions: PlaceAvailabilityException[] = [],
): string[] => {
  const exception = exceptions.find((entry) => entry.date === asIsoDate(date));
  if (exception?.isClosed) return [];

  const rule = rules.find((entry) => entry.dayOfWeek === apiDayOfWeek(date));
  // An exception can open a day the weekly rules leave closed, but only if it
  // says when
  if (!rule && !(exception?.openTime && exception?.closeTime)) return [];

  const open = toMinutes(exception?.openTime || rule!.openTime);
  const close = toMinutes(exception?.closeTime || rule!.closeTime);

  // A zero or negative interval is bad data, and a negative one would make the
  // loop below never terminate — fall back rather than trusting it
  const declaredInterval = rule?.slotIntervalMinutes ?? DEFAULT_SLOT_MINUTES;
  const interval = declaredInterval > 0 ? declaredInterval : DEFAULT_SLOT_MINUTES;

  if (open === null || close === null) return [];

  // A close time before the open time means the venue runs past midnight; the
  // slots stop at midnight rather than wrapping into the next day
  const end = close > open ? close : 24 * MINUTES_PER_HOUR;

  const slots: string[] = [];
  for (let minute = open; minute + interval <= end; minute += interval) {
    slots.push(toTimeLabel(minute));
  }
  return slots;
};

/** Whether a date can be booked at all — used to disable days in the picker. */
export const isDateBookable = (
  date: Date,
  rules: PlaceAvailabilityRule[],
  exceptions: PlaceAvailabilityException[] = [],
): boolean => slotsForDate(date, rules, exceptions).length > 0;
