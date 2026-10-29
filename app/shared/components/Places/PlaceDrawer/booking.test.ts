import {
  PlaceAvailabilityException,
  PlaceAvailabilityRule,
  PlaceReservationProfile,
} from '@/types/placeReservation';

import {
  BOOKING_WINDOW_DAYS,
  blockedRanges,
  bookingConfigFor,
  buildBookingDays,
  dayChipLabel,
  dayChipNote,
  formatSlotTime,
} from './booking';

const SUNDAY_MORNING = new Date(2026, 10, 1, 9, 0);
const TUESDAY_MORNING = new Date(2026, 10, 3, 9, 0);
const TUESDAY_LUNCH = new Date(2026, 10, 3, 11, 50);
const TUESDAY_LATE = new Date(2026, 10, 3, 21, 40);

const rule = (dayOfWeek: number): PlaceAvailabilityRule => ({
  id: `rule-${dayOfWeek}`,
  reservationProfile: 'profile-1',
  dayOfWeek,
  openTime: '11:00',
  closeTime: '22:00',
  slotIntervalMinutes: 30,
});

const TUESDAY_TO_SUNDAY = [1, 2, 3, 4, 5, 6].map(rule);

const closedOn = (date: string): PlaceAvailabilityException => ({
  id: `closed-${date}`,
  reservationProfile: 'profile-1',
  date,
  isClosed: true,
});

const profile = (seatingCapacity?: number) =>
  ({ id: 'profile-1', seatingCapacity }) as unknown as PlaceReservationProfile;

describe('bookingConfigFor', () => {
  it('limits a party to the seats the place has', () => {
    expect(bookingConfigFor(profile(12))).toEqual({ maxGuests: 12 });
  });

  it('caps a party at thirty however many seats there are', () => {
    expect(bookingConfigFor(profile(200))).toEqual({ maxGuests: 30 });
  });

  it('allows thirty when the place has not said how many seats it has', () => {
    expect(bookingConfigFor(profile(undefined))).toEqual({ maxGuests: 30 });
    expect(bookingConfigFor(profile(0))).toEqual({ maxGuests: 30 });
  });
});

describe('buildBookingDays', () => {
  const build = (now: Date, exceptions: PlaceAvailabilityException[] = []) =>
    buildBookingDays({ rules: TUESDAY_TO_SUNDAY, exceptions }, now);

  it('covers the booking window starting today', () => {
    const days = build(TUESDAY_MORNING);

    expect(days).toHaveLength(BOOKING_WINDOW_DAYS);
    expect(days[0].iso).toBe('2026-11-03');
    expect(days[13].iso).toBe('2026-11-16');
  });

  it('offers the weekly hours as slots, stopping an interval before closing', () => {
    const [today] = build(TUESDAY_MORNING);

    expect(today.slots[0]).toBe('11:00');
    expect(today.slots[today.slots.length - 1]).toBe('21:30');
  });

  it('drops the times that are too close to now to be requested', () => {
    const [today] = build(TUESDAY_LUNCH);

    expect(today.slots[0]).toBe('12:30');
  });

  it('says no times are left once the day has run out of slots', () => {
    const [today] = build(TUESDAY_LATE);

    expect(today.slots).toEqual([]);
    expect(today.isOpenDay).toBe(true);
    expect(dayChipNote(today)).toBe('No times left');
  });

  it('leaves a day with no weekly hours closed', () => {
    const days = build(SUNDAY_MORNING);
    const monday = days[1];

    expect(monday.date.format('ddd')).toBe('Mon');
    expect(monday.isOpenDay).toBe(false);
    expect(monday.slots).toEqual([]);
    expect(dayChipNote(monday)).toBe('Closed');
  });

  it('blocks a day the place has closed for the date', () => {
    const days = build(TUESDAY_MORNING, [closedOn('2026-11-04')]);
    const wednesday = days[1];

    expect(wednesday.isBlocked).toBe(true);
    expect(wednesday.slots).toEqual([]);
    expect(dayChipNote(wednesday)).toBe('Unavailable');
    expect(blockedRanges(days)).toEqual(['Wed 4 Nov']);
  });

  it('opens a closed weekday when an exception gives it hours', () => {
    const days = buildBookingDays(
      {
        rules: TUESDAY_TO_SUNDAY,
        exceptions: [
          {
            id: 'special',
            reservationProfile: 'profile-1',
            date: '2026-11-02',
            openTime: '12:00',
            closeTime: '14:00',
          },
        ],
      },
      new Date(2026, 10, 2, 8, 0),
    );

    expect(days[0].isOpenDay).toBe(true);
    expect(days[0].slots).toEqual(['12:00', '12:30', '13:00', '13:30']);
  });

  it('labels today and tomorrow, then the weekday, with the date as the note', () => {
    const days = build(TUESDAY_MORNING);

    expect(dayChipLabel(days[0])).toBe('Today');
    expect(dayChipLabel(days[1])).toBe('Tomorrow');
    expect(dayChipLabel(days[2])).toBe('Thu');
    expect(dayChipNote(days[2])).toBe('5 Nov');
  });
});

describe('formatSlotTime', () => {
  it('reads a 24 hour slot as a 12 hour time', () => {
    expect(formatSlotTime('19:30')).toBe('7:30 PM');
    expect(formatSlotTime('09:00')).toBe('9:00 AM');
  });
});
