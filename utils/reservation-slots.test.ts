import { PlaceAvailabilityException, PlaceAvailabilityRule } from '@/types/placeReservation';

import { apiDayOfWeek, isDateBookable, slotsForDate } from './reservation-slots';

const rule = (dayOfWeek: number, openTime: string, closeTime: string, interval = 60) =>
  ({
    id: `r-${dayOfWeek}`,
    reservationProfile: 'p1',
    dayOfWeek,
    openTime,
    closeTime,
    slotIntervalMinutes: interval,
  }) as PlaceAvailabilityRule;

// 2026-08-24 is a Monday
const MONDAY = new Date(2026, 7, 24);
const TUESDAY = new Date(2026, 7, 25);
const SUNDAY = new Date(2026, 7, 30);

describe('apiDayOfWeek', () => {
  // The API numbers 0=Monday..6=Sunday; JS getDay() is 0=Sunday. Getting this
  // backwards silently serves the wrong day's hours.
  it('maps Monday to 0', () => {
    expect(apiDayOfWeek(MONDAY)).toBe(0);
  });

  it('maps Sunday to 6', () => {
    expect(apiDayOfWeek(SUNDAY)).toBe(6);
  });
});

describe('slotsForDate', () => {
  it('steps from opening by the rule’s interval', () => {
    expect(slotsForDate(MONDAY, [rule(0, '18:00', '21:00', 60)])).toEqual([
      '18:00',
      '19:00',
      '20:00',
    ]);
  });

  // The last slot starts a full interval before closing, so nobody books the
  // moment the venue shuts
  it('stops an interval short of closing', () => {
    expect(slotsForDate(MONDAY, [rule(0, '18:00', '19:30', 30)])).toEqual([
      '18:00',
      '18:30',
      '19:00',
    ]);
  });

  it('handles half-hour intervals', () => {
    expect(slotsForDate(MONDAY, [rule(0, '12:00', '13:30', 30)])).toEqual([
      '12:00',
      '12:30',
      '13:00',
    ]);
  });

  it('uses the rule for that weekday only', () => {
    const rules = [rule(0, '18:00', '20:00', 60), rule(1, '09:00', '11:00', 60)];

    expect(slotsForDate(MONDAY, rules)).toEqual(['18:00', '19:00']);
    expect(slotsForDate(TUESDAY, rules)).toEqual(['09:00', '10:00']);
  });

  it('returns nothing on a day with no rule', () => {
    expect(slotsForDate(SUNDAY, [rule(0, '18:00', '21:00')])).toEqual([]);
  });

  it('accepts seconds in the time strings', () => {
    expect(slotsForDate(MONDAY, [rule(0, '18:00:00', '20:00:00', 60)])).toEqual(['18:00', '19:00']);
  });

  describe('exceptions', () => {
    const closed: PlaceAvailabilityException = {
      id: 'e1',
      reservationProfile: 'p1',
      date: '2026-08-24',
      isClosed: true,
    };

    it('closes the day outright', () => {
      expect(slotsForDate(MONDAY, [rule(0, '18:00', '21:00')], [closed])).toEqual([]);
    });

    it('overrides the hours for that date', () => {
      const override: PlaceAvailabilityException = {
        id: 'e2',
        reservationProfile: 'p1',
        date: '2026-08-24',
        openTime: '10:00',
        closeTime: '12:00',
      };

      expect(slotsForDate(MONDAY, [rule(0, '18:00', '21:00', 60)], [override])).toEqual([
        '10:00',
        '11:00',
      ]);
    });

    // A one-off opening on a normally-closed day
    it('opens a day the weekly rules leave closed', () => {
      const opening: PlaceAvailabilityException = {
        id: 'e3',
        reservationProfile: 'p1',
        date: '2026-08-30',
        openTime: '11:00',
        closeTime: '13:00',
      };

      // No weekly rule means no declared interval, so the 30-minute default
      expect(slotsForDate(SUNDAY, [], [opening])).toEqual(['11:00', '11:30', '12:00', '12:30']);
    });

    it('ignores exceptions for other dates', () => {
      const other = { ...closed, date: '2026-08-25' };

      expect(slotsForDate(MONDAY, [rule(0, '18:00', '20:00', 60)], [other])).toEqual([
        '18:00',
        '19:00',
      ]);
    });
  });

  describe('bad data', () => {
    it('treats a past-midnight close as running to midnight', () => {
      expect(slotsForDate(MONDAY, [rule(0, '22:00', '02:00', 60)])).toEqual(['22:00', '23:00']);
    });

    it('falls back to the default interval when the rule declares zero', () => {
      expect(slotsForDate(MONDAY, [rule(0, '18:00', '19:00', 0)])).toEqual(['18:00', '18:30']);
    });

    // A negative interval would make the slot loop never terminate
    it('does not hang on a negative interval', () => {
      expect(slotsForDate(MONDAY, [rule(0, '18:00', '19:00', -30)])).toEqual(['18:00', '18:30']);
    });

    it('returns nothing for an unparsable time', () => {
      expect(slotsForDate(MONDAY, [rule(0, 'nonsense', '21:00', 60)])).toEqual([]);
    });
  });
});

describe('isDateBookable', () => {
  it('is true when the day has slots', () => {
    expect(isDateBookable(MONDAY, [rule(0, '18:00', '21:00')])).toBe(true);
  });

  it('is false when it does not', () => {
    expect(isDateBookable(SUNDAY, [rule(0, '18:00', '21:00')])).toBe(false);
  });
});
