import { Experience } from '@/types/experience';

import { groupByDay } from './ReservationCalendarPanel';
import { buildPanelItems } from './panelItems';
import { ReservationView } from './types';

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

const reservationView = (experienceId: string, start: string): ReservationView =>
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
    priceAmount: null,
    currency: null,
  }) as unknown as ReservationView;

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
