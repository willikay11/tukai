import { PlaceAvailabilityRule, PlaceReservationProfile } from '@/types/placeReservation';

import {
  activeDays,
  openingHours,
  reservationSummary,
  reservationTypeLabel,
  slotInterval,
} from './reservation-summary';

const rule = (dayOfWeek: number, openTime = '08:00', closeTime = '15:00', interval = 20) =>
  ({
    id: `r-${dayOfWeek}`,
    reservationProfile: 'p1',
    dayOfWeek,
    openTime,
    closeTime,
    slotIntervalMinutes: interval,
  }) as PlaceAvailabilityRule;

const profile = (overrides: Partial<PlaceReservationProfile> = {}): PlaceReservationProfile =>
  ({
    id: 'p1',
    place: 'pl1',
    reservationType: 'restaurant_reservation',
    status: 'active',
    seatingCapacity: 45,
    ...overrides,
  }) as PlaceReservationProfile;

describe('activeDays', () => {
  // The API numbers 0=Monday..6=Sunday
  it('names the days with hours set, in week order', () => {
    expect(activeDays([rule(3), rule(2), rule(6)])).toEqual(['Wednesday', 'Thursday', 'Sunday']);
  });

  it('abbreviates when asked', () => {
    expect(activeDays([rule(2), rule(3)], true)).toEqual(['Wed', 'Thu']);
  });

  it('counts a day once however many rules it has', () => {
    expect(activeDays([rule(2), rule(2, '18:00', '22:00')])).toEqual(['Wednesday']);
  });

  it('is empty with no rules', () => {
    expect(activeDays([])).toEqual([]);
  });
});

describe('openingHours', () => {
  it('is the window every day shares', () => {
    expect(openingHours([rule(2), rule(3), rule(4)])).toBe('8:00 AM - 3:00 PM');
  });

  /**
   * Rules are per-day. Printing one day's hours where they differ would imply
   * they were every day's, so it says nothing instead.
   */
  it('is nothing where the days do not agree', () => {
    expect(openingHours([rule(2), rule(3, '18:00', '23:00')])).toBeNull();
  });

  it('is nothing with no rules at all', () => {
    expect(openingHours([])).toBeNull();
  });
});

describe('slotInterval', () => {
  it('is the gap every day agrees on', () => {
    expect(slotInterval([rule(2), rule(3)])).toBe(20);
  });

  it('is nothing where they differ', () => {
    expect(slotInterval([rule(2), rule(3, '08:00', '15:00', 45)])).toBeNull();
  });

  it('ignores a zero, which is bad data rather than a setting', () => {
    expect(slotInterval([rule(2, '08:00', '15:00', 0)])).toBeNull();
  });
});

describe('reservationTypeLabel', () => {
  it('says what the profile takes bookings for', () => {
    expect(reservationTypeLabel(profile())).toBe('Table reservations');
    expect(reservationTypeLabel(profile({ reservationType: 'cinema_reservation' }))).toBe(
      'Seat reservations',
    );
  });

  it('is nothing without a profile', () => {
    expect(reservationTypeLabel(undefined)).toBeUndefined();
  });
});

describe('reservationSummary', () => {
  it('reads as one line of what is set up', () => {
    expect(reservationSummary(profile(), [rule(2), rule(3), rule(4), rule(6)])).toBe(
      'Table reservations, 45 seats, Wed, Thu, Fri, Sun, 8:00 AM - 3:00 PM.',
    );
  });

  // Each piece is dropped rather than guessed, so the line is always true of
  // what is actually there
  it('leaves out what the profile does not carry', () => {
    expect(reservationSummary(profile({ seatingCapacity: undefined }), [])).toBe(
      'Table reservations.',
    );
  });

  it('says so when reservations are not set up at all', () => {
    expect(reservationSummary(undefined, [])).toBe('Reservations are not open here yet.');
  });
});
