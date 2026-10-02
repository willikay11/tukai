import { PlaceAvailabilityException, PlaceAvailabilityRule } from '@/types/placeReservation';
import { apiDayOfWeek } from '@/utils/reservation-slots';

const MINUTES_PER_HOUR = 60;
const MINUTES_PER_DAY = 24 * MINUTES_PER_HOUR;

/** Inside this many minutes of closing, the canvas calls it "Closes soon". */
const CLOSING_SOON_MINUTES = 60;

export type PlaceOpenState = {
  /** Open right now — drives the "Open now" wording and the un-greyed photo */
  isOpen: boolean;
  /** Open, but shutting within the hour */
  isClosingSoon: boolean;
  /**
   * The pill the canvas puts over the photo. Empty while the venue is open and
   * not about to close: a place being open is the unremarkable case and the
   * design says nothing about it.
   */
  pill: string;
  /** The line for a meta row — always said, open or shut */
  label: string;
};

/** "18:30" or "18:30:00" → minutes since midnight. */
const toMinutes = (time: string | undefined): number | null => {
  if (!time) return null;
  const [hours, minutes] = time.split(':').map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
  return hours * MINUTES_PER_HOUR + minutes;
};

/** 600 → "10 AM"; 1290 → "9:30 PM". The canvas drops a zero minute. */
const timeLabel = (minutes: number): string => {
  const hours = Math.floor(minutes / MINUTES_PER_HOUR) % 24;
  const rest = minutes % MINUTES_PER_HOUR;
  const display = hours % 12 || 12;
  const period = hours < 12 ? 'AM' : 'PM';
  return `${display}${rest ? `:${String(rest).padStart(2, '0')}` : ''} ${period}`;
};

const asIsoDate = (date: Date): string => {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
};

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

type Window = { open: number; close: number };

/**
 * The opening window for one date, or null when the venue is shut that day.
 *
 * An exception for the date wins over the weekly rule — it can close a day
 * outright, or open one the weekly rules leave closed, the same precedence the
 * booking slot picker uses.
 */
const windowForDate = (
  date: Date,
  rules: PlaceAvailabilityRule[],
  exceptions: PlaceAvailabilityException[],
): Window | null => {
  const exception = exceptions.find((entry) => entry.date === asIsoDate(date));
  if (exception?.isClosed) return null;

  const rule = rules.find((entry) => entry.dayOfWeek === apiDayOfWeek(date));
  const open = toMinutes(exception?.openTime ?? rule?.openTime);
  const close = toMinutes(exception?.closeTime ?? rule?.closeTime);
  if (open === null || close === null) return null;

  // A close time at or before the open time means the venue runs past midnight
  return { open, close: close > open ? close : close + MINUTES_PER_DAY };
};

const shiftDays = (date: Date, days: number): Date => {
  const shifted = new Date(date);
  shifted.setDate(shifted.getDate() + days);
  return shifted;
};

/**
 * Whether a place is open at `now`, and what to say about it.
 *
 * ⚠️ Hours are not on the place itself. They live on a reservation profile's
 * availability rules, so only a place opened to restaurant or cinema bookings
 * has any — everything else returns null and says nothing, rather than
 * claiming a venue is open on no evidence.
 */
export const placeOpenState = (
  rules: PlaceAvailabilityRule[],
  exceptions: PlaceAvailabilityException[] = [],
  now: Date = new Date(),
): PlaceOpenState | null => {
  if (rules.length === 0 && exceptions.length === 0) return null;

  const nowMinutes = now.getHours() * MINUTES_PER_HOUR + now.getMinutes();

  // Yesterday's window may still be running if it crossed midnight
  const yesterday = windowForDate(shiftDays(now, -1), rules, exceptions);
  const today = windowForDate(now, rules, exceptions);

  const closesAt =
    yesterday && yesterday.close > MINUTES_PER_DAY && nowMinutes < yesterday.close - MINUTES_PER_DAY
      ? yesterday.close - MINUTES_PER_DAY
      : today && nowMinutes >= today.open && nowMinutes < today.close
        ? today.close
        : null;

  if (closesAt !== null) {
    const minutesLeft = closesAt - nowMinutes;
    const isClosingSoon = minutesLeft > 0 && minutesLeft <= CLOSING_SOON_MINUTES;
    return {
      isOpen: true,
      isClosingSoon,
      pill: isClosingSoon ? 'Closes soon' : '',
      label: `Closes ${timeLabel(closesAt)}`,
    };
  }

  // Shut, but opening later the same day
  if (today && nowMinutes < today.open) {
    const opens = `Opens ${timeLabel(today.open)}`;
    return { isOpen: false, isClosingSoon: false, pill: `Closed · ${opens}`, label: opens };
  }

  // Otherwise the next day that opens at all, up to a week out
  for (let ahead = 1; ahead <= 7; ahead += 1) {
    const date = shiftDays(now, ahead);
    const next = windowForDate(date, rules, exceptions);
    if (!next) continue;
    const when = ahead === 1 ? 'tomorrow' : DAY_NAMES[apiDayOfWeek(date)];
    const opens = `Opens ${when} ${timeLabel(next.open)}`;
    return { isOpen: false, isClosingSoon: false, pill: opens, label: opens };
  }

  return { isOpen: false, isClosingSoon: false, pill: 'Closed', label: 'Closed' };
};
