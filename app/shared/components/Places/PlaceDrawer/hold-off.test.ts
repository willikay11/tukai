import { PlaceAvailabilityException, PlaceAvailabilityRule } from '@/types/placeReservation';

import {
  EMPTY_HOLD_OFF,
  HoldOffDraft,
  buildHoldOffPlan,
  describeHoldOff,
  hasCompleteHoldOffDates,
  holdOffError,
  holdOffLine,
  toHoldOffException,
  upcomingHoldOffs,
} from './hold-off';

const weekdayHours = (dayOfWeek: number): PlaceAvailabilityRule => ({
  id: `rule-${dayOfWeek}`,
  reservationProfile: 'profile-1',
  dayOfWeek,
  openTime: '11:00:00',
  closeTime: '22:00:00',
  slotIntervalMinutes: 30,
});

const TUESDAY_TO_SUNDAY = [1, 2, 3, 4, 5, 6].map(weekdayHours);

const TUESDAY = '2026-11-03';
const MONDAY = '2026-11-02';

const exception = (
  id: string,
  date: string,
  extra: Partial<PlaceAvailabilityException> = {},
): PlaceAvailabilityException => ({
  id,
  reservationProfile: 'profile-1',
  date,
  isClosed: true,
  ...extra,
});

const draft = (patch: Partial<HoldOffDraft>): HoldOffDraft => ({ ...EMPTY_HOLD_OFF, ...patch });

describe('toHoldOffException', () => {
  it('closes the day when no hours are given', () => {
    expect(toHoldOffException(TUESDAY, null, null, TUESDAY_TO_SUNDAY)).toEqual({
      date: TUESDAY,
      isClosed: true,
    });
  });

  it('closes a day that has no weekly hours to narrow', () => {
    expect(toHoldOffException(MONDAY, '12:00', '14:00', TUESDAY_TO_SUNDAY)).toEqual({
      date: MONDAY,
      isClosed: true,
    });
  });

  it('closes the day when the hold covers every open hour', () => {
    expect(toHoldOffException(TUESDAY, '10:00', '23:00', TUESDAY_TO_SUNDAY)).toEqual({
      date: TUESDAY,
      isClosed: true,
    });
  });

  it('keeps the hours after a hold that starts at opening', () => {
    expect(toHoldOffException(TUESDAY, '11:00', '14:00', TUESDAY_TO_SUNDAY)).toEqual({
      date: TUESDAY,
      isClosed: false,
      openTime: '14:00',
      closeTime: '22:00',
    });
  });

  it('keeps the hours before a hold that runs to closing', () => {
    expect(toHoldOffException(TUESDAY, '19:00', '22:00', TUESDAY_TO_SUNDAY)).toEqual({
      date: TUESDAY,
      isClosed: false,
      openTime: '11:00',
      closeTime: '19:00',
    });
  });

  it('has no way to store a hold that leaves hours open on both sides', () => {
    expect(toHoldOffException(TUESDAY, '14:00', '16:00', TUESDAY_TO_SUNDAY)).toBeNull();
  });
});

describe('holdOffError', () => {
  it('is quiet about a whole day', () => {
    expect(holdOffError(draft({ date: TUESDAY }), TUESDAY_TO_SUNDAY)).toBeNull();
  });

  it('wants both times or neither', () => {
    expect(holdOffError(draft({ date: TUESDAY, startTime: '12:00' }), TUESDAY_TO_SUNDAY)).toBe(
      'Set both a start and end time, or leave both empty.',
    );
  });

  it('wants the end after the start', () => {
    expect(
      holdOffError(
        draft({ date: TUESDAY, startTime: '14:00', endTime: '12:00' }),
        TUESDAY_TO_SUNDAY,
      ),
    ).toBe('End time must be after start time.');
  });

  it('explains a hold in the middle of the day, naming the hours that day runs', () => {
    expect(
      holdOffError(
        draft({ date: TUESDAY, startTime: '14:00', endTime: '16:00' }),
        TUESDAY_TO_SUNDAY,
      ),
    ).toBe(
      'Reservations run 11:00 AM - 10:00 PM on this date. Hold off from opening time or up to closing time, or leave the times empty for the whole day.',
    );
  });

  it('accepts a hold from opening or up to closing', () => {
    expect(
      holdOffError(
        draft({ date: TUESDAY, startTime: '11:00', endTime: '14:00' }),
        TUESDAY_TO_SUNDAY,
      ),
    ).toBeNull();
  });

  it('wants a range to end on or after the day it starts', () => {
    expect(
      holdOffError(
        draft({ mode: 'multiple-days', rangeStartDate: '2026-11-05', rangeEndDate: '2026-11-03' }),
        TUESDAY_TO_SUNDAY,
      ),
    ).toBe('End date must be on or after the start date.');
  });
});

describe('hasCompleteHoldOffDates', () => {
  it('needs one date for a few hours', () => {
    expect(hasCompleteHoldOffDates(draft({}))).toBe(false);
    expect(hasCompleteHoldOffDates(draft({ date: TUESDAY }))).toBe(true);
  });

  it('needs both ends for several days', () => {
    const several = draft({ mode: 'multiple-days', rangeStartDate: TUESDAY });

    expect(hasCompleteHoldOffDates(several)).toBe(false);
    expect(hasCompleteHoldOffDates({ ...several, rangeEndDate: '2026-11-05' })).toBe(true);
  });
});

describe('buildHoldOffPlan', () => {
  it('plans one closed day per day of a range, including both ends', () => {
    const plan = buildHoldOffPlan(
      draft({ mode: 'multiple-days', rangeStartDate: '2026-11-03', rangeEndDate: '2026-11-05' }),
      TUESDAY_TO_SUNDAY,
      [],
    );

    expect(plan.exceptions).toEqual([
      { date: '2026-11-03', isClosed: true },
      { date: '2026-11-04', isClosed: true },
      { date: '2026-11-05', isClosed: true },
    ]);
  });

  it('plans a range across a month end', () => {
    const plan = buildHoldOffPlan(
      draft({ mode: 'multiple-days', rangeStartDate: '2026-10-30', rangeEndDate: '2026-11-02' }),
      TUESDAY_TO_SUNDAY,
      [],
    );

    expect(plan.exceptions.map((entry) => entry.date)).toEqual([
      '2026-10-30',
      '2026-10-31',
      '2026-11-01',
      '2026-11-02',
    ]);
  });

  it('plans nothing for a range that ends before it starts', () => {
    expect(
      buildHoldOffPlan(
        draft({ mode: 'multiple-days', rangeStartDate: '2026-11-05', rangeEndDate: '2026-11-03' }),
        TUESDAY_TO_SUNDAY,
        [],
      ).exceptions,
    ).toEqual([]);
  });

  it('plans the surviving hours for part of a day', () => {
    const plan = buildHoldOffPlan(
      draft({ date: TUESDAY, startTime: '11:00', endTime: '14:00' }),
      TUESDAY_TO_SUNDAY,
      [],
    );

    expect(plan.exceptions).toEqual([
      { date: TUESDAY, isClosed: false, openTime: '14:00', closeTime: '22:00' },
    ]);
  });

  it('removes the exception a planned date already has, and no others', () => {
    const plan = buildHoldOffPlan(draft({ date: TUESDAY }), TUESDAY_TO_SUNDAY, [
      exception('on-the-day', TUESDAY),
      exception('elsewhere', '2026-11-09'),
    ]);

    expect(plan.replacedExceptionIds).toEqual(['on-the-day']);
  });
});

describe('upcomingHoldOffs', () => {
  const now = new Date(2026, 10, 3, 12, 0);

  it('lists held dates from today on, earliest first', () => {
    const held = upcomingHoldOffs(
      [exception('c', '2026-11-09'), exception('past', '2026-11-01'), exception('a', '2026-11-03')],
      now,
    );

    expect(held.map((entry) => entry.id)).toEqual(['a', 'c']);
  });
});

describe('describeHoldOff', () => {
  it('says a whole closed day is closed all day', () => {
    expect(describeHoldOff(exception('a', TUESDAY))).toBe('Closed all day');
  });

  it('names the hours that stay open', () => {
    expect(
      describeHoldOff(
        exception('a', TUESDAY, { isClosed: false, openTime: '14:00:00', closeTime: '22:00:00' }),
      ),
    ).toBe('Open 02:00 PM - 10:00 PM');
  });

  it('says a reopened date with no hours is open as usual', () => {
    expect(describeHoldOff(exception('a', TUESDAY, { isClosed: false }))).toBe('Open as usual');
  });
});

describe('holdOffLine', () => {
  const now = new Date(2026, 10, 3, 12, 0);

  it('says new bookings are paused when the profile is', () => {
    expect(holdOffLine('paused', [], now)).toBe('New bookings are paused.');
  });

  it('names the dates that are blocked, one range for days that run on', () => {
    const line = holdOffLine(
      'active',
      [
        exception('a', '2026-11-04'),
        exception('b', '2026-11-05'),
        exception('c', '2026-11-06'),
        exception('d', '2026-11-10'),
      ],
      now,
    );

    expect(line).toBe('Dates blocked: Wed 4 Nov to Fri 6 Nov, Tue 10 Nov.');
  });

  it('leaves out dates already gone and dates only partly held', () => {
    const line = holdOffLine(
      'active',
      [
        exception('past', '2026-11-01'),
        exception('partly', '2026-11-05', { isClosed: false, openTime: '14:00:00' }),
      ],
      now,
    );

    expect(line).toBeNull();
  });

  it('has nothing to say about a place with no holds', () => {
    expect(holdOffLine('active', [], now)).toBeNull();
  });
});
