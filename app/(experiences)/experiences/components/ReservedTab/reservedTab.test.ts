import moment from 'moment';

import { Experience } from '@/types/experience';
import { Reservation } from '@/types/ticket-purchase';

import {
  ReservationView,
  isExperiencePast,
  isExperienceUpcoming,
  isSettled,
  isUpcoming,
  toExperienceReservationViews,
  toReservationView,
} from './types';

const makeReservation = (overrides: Partial<Reservation> = {}): Reservation =>
  ({
    key: 'k1',
    experienceId: 'e1',
    occurrenceId: 'o1',
    occurrenceStart: '2026-08-29T06:00:00Z',
    occurrenceEnd: '2026-08-29T16:00:00Z',
    status: 'completed',
    ticketName: 'General',
    ticketCount: 2,
    tickets: [],
    ...overrides,
  }) as Reservation;

const experience = {
  id: 'e1',
  title: 'Mount Kenya Hike',
  photos: [{ id: 'p1', photo: 'https://cdn.tukai.co/a.jpg', isCover: true }],
  hostCommunity: { id: 'c1', title: 'Trails And Us' },
  priceStartsFrom: { amount: 20000, currency: 'KES' },
} as unknown as Experience;

describe('toReservationView', () => {
  it('joins the experience for title, cover, community and price', () => {
    const view = toReservationView(makeReservation(), [experience]);

    expect(view.title).toBe('Mount Kenya Hike');
    expect(view.coverPhoto).toBe('https://cdn.tukai.co/a.jpg');
    expect(view.communityName).toBe('Trails And Us');
    // Reservation carries no price of its own
    expect(view.priceAmount).toBe(20000);
    expect(view.currency).toBe('KES');
  });

  it('falls back to the ticket name when the experience is not loaded', () => {
    const view = toReservationView(makeReservation(), []);

    expect(view.title).toBe('General');
    expect(view.coverPhoto).toBeNull();
    expect(view.priceAmount).toBeNull();
  });
});

describe('isSettled', () => {
  it('treats completed and paid as settled', () => {
    expect(isSettled('completed')).toBe(true);
    expect(isSettled('paid')).toBe(true);
  });

  it('treats everything still needing action as unsettled', () => {
    ['pending', 'partial', 'expired', 'failed', 'cancelled'].forEach((status) =>
      expect(isSettled(status)).toBe(false),
    );
  });
});

describe('isUpcoming', () => {
  const now = new Date('2026-08-20T00:00:00Z').getTime();

  it('keeps future occurrences', () => {
    const view = { start: '2026-08-29T06:00:00Z' } as ReservationView;
    expect(isUpcoming(view, now)).toBe(true);
  });

  it('drops past occurrences', () => {
    const view = { start: '2026-08-01T06:00:00Z' } as ReservationView;
    expect(isUpcoming(view, now)).toBe(false);
  });

  it('drops reservations with no occurrence date', () => {
    expect(isUpcoming({ start: null } as ReservationView, now)).toBe(false);
  });
});

describe('toExperienceReservationViews', () => {
  const now = new Date('2026-08-20T00:00:00Z').getTime();

  const experience = (id: string, overrides: Record<string, unknown> = {}) =>
    ({
      id,
      title: `Experience ${id}`,
      photos: [],
      startDate: '2026-08-25T08:00:00Z',
      endDate: '2026-08-25T12:00:00Z',
      priceStartsFrom: { amount: 10, currency: 'KES' },
      reservedTicketsCount: 3,
      reservedTicketsAmount: { amount: '190.00', currency: 'KES' },
      ...overrides,
    }) as unknown as Experience;

  const reservation = (key: string, experienceId: string, start: string, status = 'completed') =>
    ({
      key,
      experienceId,
      occurrenceId: key,
      occurrenceStart: start,
      occurrenceEnd: start,
      status,
      ticketName: 'General',
      ticketCount: 1,
      tickets: [{ id: `t-${key}` }],
    }) as unknown as Reservation;

  // Regression: an experience booked on several dates produced one card per
  // occurrence, so the same experience appeared repeatedly
  it('returns exactly one view per experience however many occurrences were booked', () => {
    const views = toExperienceReservationViews(
      [experience('e1')],
      [
        reservation('r1', 'e1', '2026-08-25T08:00:00Z'),
        reservation('r2', 'e1', '2026-08-27T08:00:00Z'),
        reservation('r3', 'e1', '2026-08-29T08:00:00Z'),
      ],
      now,
    );

    expect(views).toHaveLength(1);
    expect(views[0].tickets).toHaveLength(3);
  });

  it('uses the API reserved count and amount paid, not the from-price', () => {
    const views = toExperienceReservationViews([experience('e1')], [], now);

    expect(views[0].ticketCount).toBe(3);
    // "190.00" arrives as a decimal string
    expect(views[0].paidAmount).toBe(190);
    expect(views[0].currency).toBe('KES');
  });

  it('shows the soonest occurrence still ahead', () => {
    const views = toExperienceReservationViews(
      [experience('e1')],
      [
        reservation('r1', 'e1', '2026-08-10T08:00:00Z'),
        reservation('r2', 'e1', '2026-08-27T08:00:00Z'),
        reservation('r3', 'e1', '2026-09-05T08:00:00Z'),
      ],
      now,
    );

    expect(views[0].start).toBe('2026-08-27T08:00:00Z');
  });

  it('merges statuses across every occurrence booked', () => {
    const views = toExperienceReservationViews(
      [experience('e1')],
      [
        reservation('r1', 'e1', '2026-08-25T08:00:00Z', 'completed'),
        reservation('r2', 'e1', '2026-08-27T08:00:00Z', 'pending'),
      ],
      now,
    );

    expect(views[0].status).toBe('pending');
  });

  it('falls back to the experience dates when no purchase rows are joined', () => {
    const views = toExperienceReservationViews([experience('e1')], [], now);

    expect(views[0].start).toBe('2026-08-25T08:00:00Z');
    expect(views[0].tickets).toEqual([]);
  });

  it('keeps a multi-day trip already under way in the upcoming list', () => {
    const [view] = toExperienceReservationViews(
      [experience('e1', { startDate: '2026-08-18T08:00:00Z', endDate: '2026-08-22T12:00:00Z' })],
      [],
      now,
    );

    expect(isExperienceUpcoming(view, now)).toBe(true);
  });

  it('drops an experience that has already ended', () => {
    const [view] = toExperienceReservationViews(
      [experience('e1', { startDate: '2026-08-01T08:00:00Z', endDate: '2026-08-02T12:00:00Z' })],
      [],
      now,
    );

    expect(isExperienceUpcoming(view, now)).toBe(false);
  });
});

// Uses the real dates from the /experiences?reserved_by= response
describe('upcoming vs past, against the real reserved payload', () => {
  const now = new Date('2026-08-20T12:00:00Z').getTime();

  const real = (title: string, startDate: string, endDate: string) =>
    ({
      id: title,
      title,
      photos: [],
      startDate,
      endDate,
      priceStartsFrom: { amount: 1, currency: 'KES' },
    }) as unknown as Experience;

  const experiences = [
    real('The Narobi Matatour', '2026-08-20T08:00:00Z', '2026-09-30T12:00:00Z'),
    real('3-Day Northern Kenya Expedition', '2026-08-13T05:20:00Z', '2026-08-17T18:00:00Z'),
    real('Recurring Experience Updated', '2026-07-28T00:00:00Z', '2026-08-31T23:59:59Z'),
  ];

  it('classifies an experience that already ended as past, not missing', () => {
    const views = toExperienceReservationViews(experiences, [], now);
    const expedition = views.find((view) => view.title.startsWith('3-Day'))!;

    expect(isExperienceUpcoming(expedition, now)).toBe(false);
    expect(isExperiencePast(expedition, now)).toBe(true);
  });

  it('keeps a still-running series upcoming when no past slot was booked', () => {
    const views = toExperienceReservationViews(experiences, [], now);
    const recurring = views.find((view) => view.title === 'Recurring Experience Updated')!;

    expect(isExperienceUpcoming(recurring, now)).toBe(true);
  });

  // The card is about the slot the user booked, not the series, so a passed
  // booking moves to Past even while the series runs on
  it('moves a series to past once the booked occurrence has gone', () => {
    const views = toExperienceReservationViews(
      experiences,
      [
        {
          key: 'r1',
          experienceId: 'Recurring Experience Updated',
          occurrenceStart: '2026-08-05T00:00:00Z',
          occurrenceEnd: '2026-08-05T04:00:00Z',
          status: 'completed',
          tickets: [],
          ticketCount: 1,
        } as unknown as Reservation,
      ],
      now,
    );
    const recurring = views.find((view) => view.title === 'Recurring Experience Updated')!;

    expect(isExperienceUpcoming(recurring, now)).toBe(false);
    expect(isExperiencePast(recurring, now)).toBe(true);
  });

  it('accounts for every reserved experience across the two sections', () => {
    const views = toExperienceReservationViews(experiences, [], now);
    const upcoming = views.filter((view) => isExperienceUpcoming(view, now));
    const past = views.filter((view) => isExperiencePast(view, now));

    // Nothing may fall through the gap between the two lists
    expect(upcoming.length + past.length).toBe(experiences.length);
  });
});
