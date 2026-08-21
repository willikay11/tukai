import { Experience } from '@/types/experience';
import { TicketPurchase } from '@/types/ticket-purchase';

import { groupReservations } from './CreatorStudioContent';

const experience = (id: string, title: string) => ({ id, title }) as unknown as Experience;

const purchase = (
  id: string,
  userId: string,
  first: string,
  price = '5000.00',
  status = 'completed',
): TicketPurchase =>
  ({
    id,
    user: { id: userId, firstName: first, lastName: 'Kamau', displayName: '', picture: null },
    ticketNumber: `TKT-${id}`,
    ticket: { id: 't', name: 'General', price, currency: 'Ksh.', experience: 'e1' },
    status,
  }) as unknown as TicketPurchase;

const e1 = experience('e1', 'Mt Kenya');
const e2 = experience('e2', "Hell's Gate");

describe('groupReservations', () => {
  // The endpoint returns one row per ticket; the table shows one row per guest
  it('sums a guest tickets and spend for one experience', () => {
    const rows = groupReservations([
      { purchase: purchase('p1', 'u1', 'Wanjiru'), experience: e1 },
      { purchase: purchase('p2', 'u1', 'Wanjiru'), experience: e1 },
    ]);

    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ guestName: 'Wanjiru Kamau', tickets: 2, amount: 10000 });
  });

  it('keeps the same guest separate per experience', () => {
    const rows = groupReservations([
      { purchase: purchase('p1', 'u1', 'Wanjiru'), experience: e1 },
      { purchase: purchase('p2', 'u1', 'Wanjiru'), experience: e2 },
    ]);

    expect(rows).toHaveLength(2);
    expect(rows.map((row) => row.experienceTitle)).toEqual(['Mt Kenya', "Hell's Gate"]);
  });

  it('keeps different guests apart', () => {
    const rows = groupReservations([
      { purchase: purchase('p1', 'u1', 'Wanjiru'), experience: e1 },
      { purchase: purchase('p2', 'u2', 'Brian'), experience: e1 },
    ]);

    expect(rows).toHaveLength(2);
  });

  it('falls back to a generic name when the purchase has no user', () => {
    const anonymous = { ...purchase('p1', 'u1', 'X'), user: null } as unknown as TicketPurchase;

    expect(groupReservations([{ purchase: anonymous, experience: e1 }])[0].guestName).toBe('Guest');
  });

  // The purchase record carries no payment method
  it('shows a placeholder for the payment method', () => {
    const rows = groupReservations([{ purchase: purchase('p1', 'u1', 'Wanjiru'), experience: e1 }]);

    expect(rows[0].method).toBe('—');
  });

  it('carries the purchase status through for the badge', () => {
    const rows = groupReservations([
      { purchase: purchase('p1', 'u1', 'Wanjiru', '5000.00', 'pending'), experience: e1 },
    ]);

    expect(rows[0].status).toBe('pending');
  });

  it('treats an unparseable price as zero rather than NaN', () => {
    const rows = groupReservations([
      { purchase: purchase('p1', 'u1', 'Wanjiru', 'not-a-price'), experience: e1 },
    ]);

    expect(rows[0].amount).toBe(0);
  });
});
