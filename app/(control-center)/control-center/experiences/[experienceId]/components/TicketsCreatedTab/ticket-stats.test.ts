import { Ticket } from '@/types/ticket';

import {
  splitBySales,
  ticketShareLink,
  ticketShareMessage,
  ticketStats,
  ticketsSold,
} from './ticket-stats';

const ticket = (overrides: Partial<Ticket> = {}): Ticket =>
  ({
    id: 't1',
    name: 'Early Bird',
    quantity: 50,
    availableQuantity: 20,
    price: 1500,
    experience: 'e1',
    ...overrides,
  }) as unknown as Ticket;

const statFor = (t: Ticket, label: string) =>
  ticketStats(t, 'KES').find((stat) => stat.label === label);

describe('ticketsSold', () => {
  it('is what is no longer available', () => {
    expect(ticketsSold(ticket())).toBe(30);
  });

  // A quantity edited down below what has sold would otherwise read as negative
  it('never goes below zero', () => {
    expect(ticketsSold(ticket({ quantity: 10, availableQuantity: 20 }))).toBe(0);
  });
});

/**
 * The canvas's seven figures, in its order and its wording, with the last one
 * spanning the row.
 */
describe('ticketStats', () => {
  it('gives seven figures in the canvas order', () => {
    expect(ticketStats(ticket(), 'KES').map((stat) => stat.label)).toEqual([
      'Ticket currency',
      'Tickets created',
      'Amount per ticket',
      'Tickets sold',
      'Amount sold',
      'Available tickets',
      'Estimated sales expiry',
    ]);
  });

  it('spans only the last one', () => {
    const spanning = ticketStats(ticket(), 'KES').filter((stat) => stat.full);

    expect(spanning).toHaveLength(1);
    expect(spanning[0].label).toBe('Estimated sales expiry');
  });

  it('writes the currency out', () => {
    expect(statFor(ticket(), 'Ticket currency')?.value).toBe('Kenya shillings');
    expect(ticketStats(ticket(), 'USD')[0].value).toBe('US dollars');
  });

  it('multiplies what sold by the price', () => {
    expect(statFor(ticket(), 'Amount sold')?.value).toBe('KES 45,000');
  });

  it('calls a free ticket free', () => {
    expect(statFor(ticket({ price: 0 }), 'Amount per ticket')?.value).toBe('Free');
    expect(statFor(ticket({ price: 0 }), 'Amount sold')?.value).toBe('KES 0');
  });

  it('says when sales are expected to close', () => {
    expect(
      statFor(ticket({ salesEndDate: '2026-07-05T18:30:00Z' }), 'Estimated sales expiry')?.value,
    ).toMatch(/5 Jul 2026/);
  });

  it('leaves a dash when no expiry is set', () => {
    expect(statFor(ticket(), 'Estimated sales expiry')?.value).toBe('-');
  });

  // Pause is the more important fact, so it takes that place in the block
  it('says sales are paused in place of the expiry', () => {
    const paused = ticket({ ticketSalesPausedAt: '2026-09-30T10:00:00Z' });

    expect(statFor(paused, 'Ticket sales')).toMatchObject({ value: 'Paused', full: true });
    expect(statFor(paused, 'Estimated sales expiry')).toBeUndefined();
  });
});

describe('splitBySales', () => {
  it('keeps what is on sale apart from what is paused', () => {
    const live = ticket();
    const off = ticket({ id: 't2', ticketSalesPausedAt: '2026-09-30T10:00:00Z' });

    expect(splitBySales([live, off])).toEqual({ active: [live], paused: [off] });
  });

  // The API answers with either spelling depending on which serializer replied
  it('reads the snake_case spelling too', () => {
    const off = ticket({ ticket_sales_paused_at: '2026-09-30T10:00:00Z' } as Partial<Ticket>);

    expect(splitBySales([off]).paused).toHaveLength(1);
  });
});

describe('ticketShareLink', () => {
  it('points at the experience, by slug', () => {
    expect(ticketShareLink({ id: 'e1', slug: 'sunrise-hike' })).toContain(
      '/experiences/sunrise-hike',
    );
  });

  // A record made before slugs, or one still without one, still resolves by id
  it('falls back to the id', () => {
    expect(ticketShareLink({ id: 'e1' })).toContain('/experiences/e1');
  });
});

describe('ticketShareMessage', () => {
  it('names the type and where it is sold', () => {
    expect(ticketShareMessage(ticket(), 'Sunrise hike')).toBe(
      'Early Bird is on sale on the Sunrise hike page.',
    );
  });
});
