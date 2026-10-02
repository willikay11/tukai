import { PlaceAvailabilityException, PlaceAvailabilityRule } from '@/types/placeReservation';

import { placeOpenState } from './place-hours';

const rule = (dayOfWeek: number, openTime: string, closeTime: string) =>
  ({
    id: `r-${dayOfWeek}`,
    reservationProfile: 'p1',
    dayOfWeek,
    openTime,
    closeTime,
    slotIntervalMinutes: 60,
  }) as PlaceAvailabilityRule;

const exception = (entry: Partial<PlaceAvailabilityException>) =>
  ({ id: 'e1', reservationProfile: 'p1', ...entry }) as PlaceAvailabilityException;

// 2026-08-24 is a Monday, so the API's day 0
const at = (hours: number, minutes = 0) => new Date(2026, 7, 24, hours, minutes);

// Mon–Fri 10:00–22:00, shut at the weekend
const WEEKDAYS = [0, 1, 2, 3, 4].map((day) => rule(day, '10:00', '22:00'));

describe('placeOpenState', () => {
  // Most places have no reservation profile at all, and a place with no hours
  // must not be called open — the caller renders nothing instead
  it('says nothing when there are no rules or exceptions', () => {
    expect(placeOpenState([], [], at(12))).toBeNull();
  });

  it('is open inside the window, with no pill', () => {
    expect(placeOpenState(WEEKDAYS, [], at(12))).toEqual({
      isOpen: true,
      isClosingSoon: false,
      pill: '',
      label: 'Closes 10 PM',
    });
  });

  it('warns in the last hour before closing', () => {
    expect(placeOpenState(WEEKDAYS, [], at(21, 30))).toEqual({
      isOpen: true,
      isClosingSoon: true,
      pill: 'Closes soon',
      label: 'Closes 10 PM',
    });
  });

  // The boundary is inclusive, as the canvas has it: a full hour out still
  // warns, a minute more does not
  it('warns at exactly an hour out but not before', () => {
    expect(placeOpenState(WEEKDAYS, [], at(21))?.isClosingSoon).toBe(true);
    expect(placeOpenState(WEEKDAYS, [], at(20, 59))?.isClosingSoon).toBe(false);
  });

  it('gives the opening time when it is shut earlier the same day', () => {
    expect(placeOpenState(WEEKDAYS, [], at(8))).toEqual({
      isOpen: false,
      isClosingSoon: false,
      pill: 'Closed · Opens 10 AM',
      label: 'Opens 10 AM',
    });
  });

  it('rolls to tomorrow once the day is over', () => {
    expect(placeOpenState(WEEKDAYS, [], at(23))?.label).toBe('Opens tomorrow 10 AM');
  });

  it('names the weekday when the next opening is further out', () => {
    // Saturday the 29th: the next weekday rule is Monday's
    expect(placeOpenState(WEEKDAYS, [], new Date(2026, 7, 29, 12))?.label).toBe('Opens Mon 10 AM');
  });

  it('keeps the minutes when an opening is not on the hour', () => {
    expect(placeOpenState([rule(0, '09:30', '17:00')], [], at(8))?.label).toBe('Opens 9:30 AM');
  });

  it('closes a day outright when an exception says so', () => {
    const closedToday = [exception({ date: '2026-08-24', isClosed: true })];
    expect(placeOpenState(WEEKDAYS, closedToday, at(12))?.label).toBe('Opens tomorrow 10 AM');
  });

  it('lets an exception replace the day’s hours', () => {
    const shortDay = [exception({ date: '2026-08-24', openTime: '10:00', closeTime: '13:00' })];
    expect(placeOpenState(WEEKDAYS, shortDay, at(14))?.label).toBe('Opens tomorrow 10 AM');
  });

  it('lets an exception open a day the weekly rules leave shut', () => {
    const openSaturday = [exception({ date: '2026-08-29', openTime: '11:00', closeTime: '16:00' })];
    expect(placeOpenState(WEEKDAYS, openSaturday, new Date(2026, 7, 29, 12))).toEqual({
      isOpen: true,
      isClosingSoon: false,
      pill: '',
      label: 'Closes 4 PM',
    });
  });

  // A bar that shuts at 02:00 is open at midnight, on the previous day's rule.
  // Reading the clock alone would call it closed all night.
  describe('a window that runs past midnight', () => {
    const LATE = [0, 1, 2, 3, 4].map((day) => rule(day, '18:00', '02:00'));

    it('is open after midnight on yesterday’s window', () => {
      // Tuesday 00:30, still inside Monday's 18:00–02:00
      expect(placeOpenState(LATE, [], new Date(2026, 7, 25, 0, 30))).toEqual({
        isOpen: true,
        isClosingSoon: false,
        pill: '',
        label: 'Closes 2 AM',
      });
    });

    it('warns in the last hour after midnight', () => {
      expect(placeOpenState(LATE, [], new Date(2026, 7, 25, 1, 30))?.pill).toBe('Closes soon');
    });

    it('is shut again between closing and opening', () => {
      expect(placeOpenState(LATE, [], new Date(2026, 7, 25, 3))?.label).toBe('Opens 6 PM');
    });
  });

  it('says only “Closed” when nothing in the week opens', () => {
    const past = [exception({ date: '2020-01-01', openTime: '10:00', closeTime: '12:00' })];
    expect(placeOpenState([], past, at(12))).toEqual({
      isOpen: false,
      isClosingSoon: false,
      pill: 'Closed',
      label: 'Closed',
    });
  });
});
