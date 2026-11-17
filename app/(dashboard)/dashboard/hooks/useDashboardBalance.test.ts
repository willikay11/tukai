import { renderHook } from '@testing-library/react';

import { useDashboardBalance } from './useDashboardBalance';

const money = (amount: string, currency = 'KES') => ({ amount, currency });

// The earnings summary exactly as the API sends it: every figure is a money object
const summary = {
  totalTicketSales: money('12000.00'),
  amountPaid: money('9600.00'),
  hostFundedDiscount: money('2400.00'),
  tukaiFundedDiscount: money('0.00'),
  hostNet: money('9120.00'),
  availableBalance: money('7500.50'),
  pendingBalance: money('1620.00'),
  currentBalance: money('9120.50'),
  commissionDeducted: money('480.00'),
  estimatedPayoutFee: money('50.00'),
  ticketsOnSale: money('0.00'),
};

let earnings: { data?: { data: typeof summary | null }; isLoading: boolean };

jest.mock('@/app/(experiences)/hooks/usePayment', () => ({
  useEarningsSummary: () => earnings,
}));

jest.mock('@/app/shared/hooks/useExperiences', () => ({
  useExperiences: () => ({ data: { data: { results: [] } }, isLoading: false }),
}));

describe('useDashboardBalance', () => {
  beforeEach(() => {
    earnings = { data: { data: summary }, isLoading: false };
  });

  // Reading these objects as strings printed KES 0.00 for every host
  it('shows the balances from the money objects', () => {
    const { result } = renderHook(() => useDashboardBalance('host-1'));

    expect(result.current.totalLabel).toBe('KES 9,120.50');
    expect(result.current.balances[0]).toEqual({ label: 'Available', value: 'KES 7,500.50' });
    expect(result.current.balances[1]).toEqual({ label: 'Pending', value: 'KES 1,620.00' });
  });

  it('hands the Withdraw drawer the available amount as a decimal string', () => {
    const { result } = renderHook(() => useDashboardBalance('host-1'));

    expect(result.current.availableBalance).toBe('7500.50');
    expect(result.current.pendingBalance).toBe(1620);
  });

  // List price before promo discounts: never shown as money received
  it('never shows total ticket sales as a balance', () => {
    const { result } = renderHook(() => useDashboardBalance('host-1'));
    const shown = [result.current.totalLabel, ...result.current.balances.map((row) => row.value)];

    expect(shown).not.toContain('KES 12,000.00');
  });

  it('shows zero while there is no summary yet', () => {
    earnings = { data: { data: null }, isLoading: true };
    const { result } = renderHook(() => useDashboardBalance('host-1'));

    expect(result.current.isLoading).toBe(true);
    expect(result.current.totalLabel).toBe('KES 0.00');
    expect(result.current.availableBalance).toBe('0');
  });
});
