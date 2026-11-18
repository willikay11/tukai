import { HostIncomeEntry } from '@/types/payment';

import { incomeRows } from './income-rows';

const kes = (amount: string) => ({ amount, currency: 'KES' });

// GET /wallets/income/, after parseSnakeToCamel (DEV-372)
const entry = (overrides: Partial<HostIncomeEntry> = {}): HostIncomeEntry => ({
  id: 'e1',
  kind: 'sale',
  datePosted: '2026-11-12T19:26:00Z',
  currency: 'KES',
  amount: kes('1152.00'),
  saleAmount: kes('1200.00'),
  listAmount: kes('1200.00'),
  hostFundedDiscount: kes('0.00'),
  tukaiFundedDiscount: kes('0.00'),
  commission: kes('48.00'),
  promoCode: null,
  experience: { id: 'x1', title: 'Kitini III', slug: 'kitini-iii' },
  purchaseId: 'p1',
  purchaseNumber: 'PUR6B1MJ9WQ',
  productName: 'Standard',
  ...overrides,
});

describe('incomeRows', () => {
  it('shows a ticket sale as money in, at what the host earned', () => {
    expect(incomeRows([entry()])).toEqual([
      {
        key: 'income-e1',
        date: '2026-11-12T19:26:00Z',
        title: 'Kitini III',
        via: 'Ticket sale · Standard',
        amount: 'KES 1,152.00',
        direction: 'in',
      },
    ]);
  });

  it('names the promo code used', () => {
    expect(incomeRows([entry({ promoCode: 'JULY500' })])[0].via).toBe(
      'Ticket sale · Standard · code JULY500',
    );
  });

  // A refund or cancellation takes the earnings back
  it('shows a refund as money out, without a minus sign', () => {
    const [row] = incomeRows([entry({ kind: 'sale_reversal', amount: kes('-1152.00') })]);

    expect(row).toMatchObject({
      via: 'Refund · Standard',
      amount: 'KES 1,152.00',
      direction: 'out',
    });
  });

  it('sends a correction whichever way its amount goes', () => {
    const [up, down] = incomeRows([
      entry({ id: 'c1', kind: 'correction', amount: kes('100.00') }),
      entry({ id: 'c2', kind: 'correction', amount: kes('-40.00') }),
    ]);

    expect(up.direction).toBe('in');
    expect(down.direction).toBe('out');
    expect(down.via).toBe('Correction · Standard');
  });
});
