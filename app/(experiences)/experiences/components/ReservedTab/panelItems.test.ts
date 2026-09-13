import { Experience } from '@/types/experience';
import { Reservation } from '@/types/ticket-purchase';

import { groupByDay, initialMonthFor } from './ReservationCalendarPanel';
import { PanelItem, buildPanelItems } from './panelItems';
import { ExperienceReservationView, toExperienceReservationViews } from './types';

const experience = (id: string, overrides: Record<string, unknown> = {}) =>
  ({
    id,
    title: `Experience ${id}`,
    photos: [{ id: 'p', photo: `https://cdn.tukai.co/${id}.jpg`, isCover: true }],
    startDate: '2026-08-28T07:00:00Z',
    endDate: '2026-08-28T10:00:00Z',
    isPaid: true,
    priceStartsFrom: { amount: 1200, currency: 'KES' },
    ...overrides,
  }) as unknown as Experience;

const reservationView = (experienceId: string, start: string): ExperienceReservationView =>
  ({
    key: `r-${experienceId}`,
    experienceId,
    title: `Experience ${experienceId}`,
    coverPhoto: null,
    communityName: null,
    start,
    end: start,
    status: 'completed',
    ticketCount: 1,
    tickets: [{ id: 't1' }],
    paidAmount: null,
    currency: null,
  }) as unknown as ExperienceReservationView;

describe('buildPanelItems', () => {
  it('merges reservations and invites onto one date-ordered timeline', () => {
    const items = buildPanelItems(
      [reservationView('e1', '2026-08-29T17:00:00Z')],
      [experience('e1', { startDate: '2026-08-29T17:00:00Z' })],
      [experience('e2', { startDate: '2026-08-28T07:00:00Z' })],
    );

    expect(items.map((item) => item.kind)).toEqual(['invite', 'reservation']);
    expect(items[0].start).toBe('2026-08-28T07:00:00Z');
  });

  // An invite the user already booked is a reservation, not an open invite
  it('does not list an invite the user has already reserved', () => {
    const items = buildPanelItems(
      [reservationView('e1', '2026-08-29T17:00:00Z')],
      [experience('e1')],
      [experience('e1')],
    );

    expect(items).toHaveLength(1);
    expect(items[0].kind).toBe('reservation');
  });

  it('labels a paid experience with its from-price', () => {
    const items = buildPanelItems([], [], [experience('e2')]);

    expect(items[0].priceLabel).toBe('from KES 1,200');
  });

  it('labels a free experience as Free rather than a price', () => {
    const items = buildPanelItems([], [], [experience('e2', { isPaid: false })]);

    expect(items[0].priceLabel).toBe('Free');
  });

  it('carries the reservation through so the ticket modal can open', () => {
    const items = buildPanelItems(
      [reservationView('e1', '2026-08-29T17:00:00Z')],
      [experience('e1')],
      [],
    );

    expect(items[0].reservation?.tickets).toHaveLength(1);
  });

  it('gives invites no reservation, so no ticket action is offered', () => {
    const items = buildPanelItems([], [], [experience('e2')]);

    expect(items[0].reservation).toBeUndefined();
  });
});

describe('groupByDay', () => {
  it('buckets items by calendar day', () => {
    const items = buildPanelItems(
      [
        reservationView('e1', '2026-08-29T17:00:00Z'),
        reservationView('e2', '2026-08-29T16:30:00Z'),
        reservationView('e3', '2026-08-31T08:00:00Z'),
      ],
      [],
      [],
    );

    const grouped = groupByDay(items);

    expect(Object.keys(grouped).sort()).toEqual(['2026-08-29', '2026-08-31']);
    expect(grouped['2026-08-29']).toHaveLength(2);
  });
});

describe('initialMonthFor', () => {
  const now = new Date('2026-08-20T12:00:00Z');
  const at = (start: string): PanelItem =>
    ({
      id: start,
      kind: 'reservation',
      experienceId: 'e',
      title: 't',
      coverPhoto: null,
      start,
      end: start,
      priceLabel: null,
    }) as PanelItem;

  // Regression: the panel opened on the earliest item, so one old booking from
  // March pinned it to March instead of showing the current month
  it('ignores an old booking and opens on the current month', () => {
    const month = initialMonthFor([at('2026-03-04T08:00:00Z'), at('2026-08-29T17:00:00Z')], now);

    expect(month.format('MMMM YYYY')).toBe('August 2026');
  });

  it('opens on the current month even when only past bookings exist', () => {
    const month = initialMonthFor([at('2026-03-04T08:00:00Z')], now);

    expect(month.format('MMMM YYYY')).toBe('August 2026');
  });

  // Only jump forward when there is nothing to show right now
  it('jumps to the next month that has bookings when this one is empty', () => {
    const month = initialMonthFor([at('2026-03-04T08:00:00Z'), at('2026-10-02T08:00:00Z')], now);

    expect(month.format('MMMM YYYY')).toBe('October 2026');
  });

  it('prefers the current month over a later one', () => {
    const month = initialMonthFor([at('2026-08-31T08:00:00Z'), at('2026-09-01T08:00:00Z')], now);

    expect(month.format('MMMM YYYY')).toBe('August 2026');
  });

  it('falls back to the current month with no items at all', () => {
    expect(initialMonthFor([], now).format('MMMM YYYY')).toBe('August 2026');
  });
});

// Regression: rows were built per occurrence, so an experience booked on three
// dates produced three rows. A row is now the experience; the ticket modal is
// what pages through its individual tickets.
describe('one row per experience', () => {
  const now = new Date('2026-08-20T12:00:00Z').getTime();

  it('collapses several booked occurrences into a single row', () => {
    const experiences = [experience('e1', { startDate: '2026-08-27T18:00:00Z' })];
    const reservations = [
      {
        key: 'r1',
        experienceId: 'e1',
        occurrenceStart: '2026-08-27T18:00:00Z',
        occurrenceEnd: '2026-08-27T20:00:00Z',
        status: 'completed',
        tickets: [{ id: 't1' }],
        ticketCount: 1,
      },
      {
        key: 'r2',
        experienceId: 'e1',
        occurrenceStart: '2026-08-29T18:00:00Z',
        occurrenceEnd: '2026-08-29T20:00:00Z',
        status: 'completed',
        tickets: [{ id: 't2' }],
        ticketCount: 1,
      },
      {
        key: 'r3',
        experienceId: 'e1',
        occurrenceStart: '2026-08-31T18:00:00Z',
        occurrenceEnd: '2026-08-31T20:00:00Z',
        status: 'completed',
        tickets: [{ id: 't3' }],
        ticketCount: 1,
      },
    ] as unknown as Reservation[];

    const views = toExperienceReservationViews(experiences, reservations, now);
    const items = buildPanelItems(views, experiences, []);

    expect(items).toHaveLength(1);
    // All three tickets are reachable from that one row
    expect(items[0].reservation?.tickets).toHaveLength(3);
  });

  it('anchors the row to the soonest date still ahead', () => {
    const experiences = [experience('e1')];
    const reservations = [
      {
        key: 'r1',
        experienceId: 'e1',
        occurrenceStart: '2026-08-10T18:00:00Z',
        occurrenceEnd: '2026-08-10T20:00:00Z',
        status: 'completed',
        tickets: [],
        ticketCount: 1,
      },
      {
        key: 'r2',
        experienceId: 'e1',
        occurrenceStart: '2026-08-29T18:00:00Z',
        occurrenceEnd: '2026-08-29T20:00:00Z',
        status: 'completed',
        tickets: [],
        ticketCount: 1,
      },
    ] as unknown as Reservation[];

    const views = toExperienceReservationViews(experiences, reservations, now);
    const items = buildPanelItems(views, experiences, []);

    expect(items[0].start).toBe('2026-08-29T18:00:00Z');
  });

  it('still keeps different experiences as separate rows', () => {
    const experiences = [experience('e1'), experience('e2')];
    const reservations = [
      {
        key: 'r1',
        experienceId: 'e1',
        occurrenceStart: '2026-08-27T18:00:00Z',
        occurrenceEnd: '2026-08-27T20:00:00Z',
        status: 'completed',
        tickets: [],
        ticketCount: 1,
      },
      {
        key: 'r2',
        experienceId: 'e2',
        occurrenceStart: '2026-08-29T18:00:00Z',
        occurrenceEnd: '2026-08-29T20:00:00Z',
        status: 'completed',
        tickets: [],
        ticketCount: 1,
      },
    ] as unknown as Reservation[];

    const views = toExperienceReservationViews(experiences, reservations, now);

    expect(buildPanelItems(views, experiences, [])).toHaveLength(2);
  });
});
