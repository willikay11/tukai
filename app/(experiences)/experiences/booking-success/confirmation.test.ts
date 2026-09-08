import { Experience } from '@/types/experience';
import { TicketPurchase } from '@/types/ticket-purchase';

import { purchasesFromSameCheckout, toConfirmation } from './confirmation';

const purchase = (extra: Partial<TicketPurchase> = {}): TicketPurchase =>
  ({
    id: 'p1',
    ticketNumber: 'TKT-1',
    ticket: { id: 't1', name: 'Locals', price: '10000', currency: 'Ksh.', experience: 'e1' },
    occurrence: { id: 'o1', startDate: '2026-03-17T06:00:00Z', endDate: '2026-03-17T12:00:00Z' },
    qrCodeImage: null,
    ticketPdf: null,
    status: 'completed',
    dateCreated: '2026-03-01T09:07:00Z',
    ...extra,
  }) as TicketPurchase;

const experience = {
  title: 'Ngong Hills Ridge',
  currency: 'Ksh.',
  photos: [],
} as unknown as Experience;

describe('purchasesFromSameCheckout', () => {
  // One purchase per ticket, and no order id on the row — the occurrence and
  // the second they were created in are what tie a batch together
  it('keeps the rows bought together and drops an older booking', () => {
    const batch = [
      purchase({ id: 'p1' }),
      purchase({ id: 'p2', ticketNumber: 'TKT-2' }),
      purchase({ id: 'old', dateCreated: '2026-02-01T09:07:00Z' }),
    ];

    const result = purchasesFromSameCheckout(batch, null);

    expect(result.map((entry) => entry.id)).toEqual(['p1', 'p2']);
  });

  it('drops a booking for another occurrence', () => {
    const batch = [
      purchase({ id: 'p1' }),
      purchase({
        id: 'other-slot',
        occurrence: {
          id: 'o2',
          startDate: '2026-03-18T06:00:00Z',
          endDate: '2026-03-18T12:00:00Z',
        },
      }),
    ];

    expect(purchasesFromSameCheckout(batch, null).map((entry) => entry.id)).toEqual(['p1']);
  });

  it('anchors on the reference the buyer arrived with', () => {
    const batch = [
      purchase({ id: 'newest', dateCreated: '2026-03-05T09:07:00Z' }),
      purchase({ id: 'referenced', ticketNumber: 'TKT-REF' }),
    ];

    const result = purchasesFromSameCheckout(batch, 'TKT-REF');

    expect(result.map((entry) => entry.id)).toEqual(['referenced']);
  });

  // The page is opened for a purchase by id, which beats guessing from a
  // reference or a timestamp
  it('anchors on the purchase the page was opened for', () => {
    const named = purchase({ id: 'named', dateCreated: '2026-02-01T09:07:00Z' });
    const batch = [purchase({ id: 'newest', dateCreated: '2026-03-05T09:07:00Z' }), named];

    const result = purchasesFromSameCheckout(batch, null, named);

    expect(result.map((entry) => entry.id)).toEqual(['named']);
  });

  it('has nothing to show without purchases', () => {
    expect(purchasesFromSameCheckout([], null)).toEqual([]);
  });
});

describe('toConfirmation', () => {
  it('groups the tickets bought into one line per type', () => {
    const confirmation = toConfirmation(
      [
        purchase({ id: 'p1' }),
        purchase({ id: 'p2' }),
        purchase({
          id: 'p3',
          ticket: { id: 't2', name: 'Children', price: '5000', currency: 'Ksh.', experience: 'e1' },
        }),
      ],
      experience,
      'TRN-123',
    );

    expect(confirmation?.lineItems).toEqual([
      { label: 'Locals', quantity: 2, unitPrice: 10000, lineTotal: 20000 },
      { label: 'Children', quantity: 1, unitPrice: 5000, lineTotal: 5000 },
    ]);
    expect(confirmation?.amountPaid).toBe(25000);
  });

  it('shows the reference the buyer arrived with', () => {
    expect(toConfirmation([purchase()], experience, 'TRN-123')?.reference).toBe('TRN-123');
  });

  // Support asks for one or the other, so the ticket number stands in
  it('falls back to the ticket number when there is no reference', () => {
    expect(toConfirmation([purchase()], experience, null)?.reference).toBe('TKT-1');
  });

  it('takes the date and times from the occurrence', () => {
    const confirmation = toConfirmation([purchase()], experience, null);

    expect(confirmation?.experience.date).toBe('2026-03-17');
    expect(confirmation?.experience.title).toBe('Ngong Hills Ridge');
  });

  it('reports the purchase status, for the badge', () => {
    expect(toConfirmation([purchase({ status: 'pending' })], experience, null)?.status).toBe(
      'pending',
    );
  });

  it('is null when nothing was found', () => {
    expect(toConfirmation([], experience, 'TRN-123')).toBeNull();
  });
});
