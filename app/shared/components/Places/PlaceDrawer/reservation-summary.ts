import { PlaceAvailabilityRule, PlaceReservationProfile } from '@/types/placeReservation';
import { formatTimeTo12Hour } from '@/utils/date-utils';

/** The API numbers its days 0=Monday..6=Sunday. */
const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DAY_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const RESERVATION_TYPE_LABELS: Record<string, string> = {
  restaurant_reservation: 'Table reservations',
  cinema_reservation: 'Seat reservations',
};

/** What the profile takes bookings for, in words. */
export const reservationTypeLabel = (profile?: PlaceReservationProfile): string | undefined =>
  profile ? (RESERVATION_TYPE_LABELS[profile.reservationType] ?? 'Reservations') : undefined;

/** The days with hours set, in week order and named. */
export const activeDays = (rules: PlaceAvailabilityRule[], short = false): string[] => {
  const names = short ? DAY_SHORT : DAY_NAMES;

  // Array.from rather than a spread: the build targets a version where a Set
  // is not iterable that way
  return Array.from(new Set(rules.map((rule) => rule.dayOfWeek)))
    .filter((day) => day >= 0 && day < names.length)
    .sort((left, right) => left - right)
    .map((day) => names[day]);
};

/**
 * "8:00 AM - 3:00 PM", or null where the days do not share one window.
 *
 * Rules are per-day, so a place open late on a Friday has no single pair of
 * hours to print. Saying nothing beats printing one day's and implying it is
 * every day's.
 */
export const openingHours = (rules: PlaceAvailabilityRule[]): string | null => {
  if (rules.length === 0) return null;

  const windows = new Set(rules.map((rule) => `${rule.openTime}|${rule.closeTime}`));
  if (windows.size !== 1) return null;

  const [first] = rules;
  return `${formatTimeTo12Hour(first.openTime)} - ${formatTimeTo12Hour(first.closeTime)}`;
};

/** The gap the picker steps by, where every day agrees on one. */
export const slotInterval = (rules: PlaceAvailabilityRule[]): number | null => {
  const intervals = new Set(
    rules.map((rule) => rule.slotIntervalMinutes).filter((minutes) => minutes > 0),
  );

  return intervals.size === 1 ? Array.from(intervals)[0] : null;
};

/**
 * The one line a manager reads before deciding whether to open the settings:
 * what it takes, how many it seats, which days and when.
 *
 * Each piece is dropped rather than guessed when the profile does not carry
 * it, so the line is always true of what is actually set up.
 */
export const reservationSummary = (
  profile: PlaceReservationProfile | undefined,
  rules: PlaceAvailabilityRule[],
): string => {
  if (!profile) return 'Reservations are not open here yet.';

  const days = activeDays(rules, true);
  const hours = openingHours(rules);

  const parts = [
    reservationTypeLabel(profile),
    profile.seatingCapacity ? `${profile.seatingCapacity} seats` : null,
    days.length > 0 ? days.join(', ') : null,
    hours,
  ].filter(Boolean);

  return parts.length > 0 ? `${parts.join(', ')}.` : 'Reservations are set up here.';
};
