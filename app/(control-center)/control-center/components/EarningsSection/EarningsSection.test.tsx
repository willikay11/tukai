import React from 'react';

import { render, screen } from '@testing-library/react';

import { HostEarningsSummary, HostPayout } from '@/types/payment';

import { EarningsSection } from './index';

let summary: HostEarningsSummary | null = null;
let payouts: HostPayout[] | { results: HostPayout[] } = [];
let isSummaryLoading = false;
let arePayoutsLoading = false;

jest.mock('@/app/(experiences)/hooks/usePayment', () => ({
  useEarningsSummary: () => ({ data: { data: summary }, isLoading: isSummaryLoading }),
  usePayouts: () => ({ data: { data: payouts }, isLoading: arePayoutsLoading }),
}));

// Both open below the figures and are covered by their own tests
jest.mock('../WalletsSection', () => ({ WalletsSection: () => null }));
jest.mock('../WithdrawDrawer', () => ({ WithdrawDrawer: () => null }));

const earnings = (overrides: Partial<HostEarningsSummary> = {}): HostEarningsSummary => ({
  totalTicketSales: '120000.00',
  availableBalance: '45000.00',
  pendingBalance: '15000.00',
  currentBalance: '60000.00',
  commissionDeducted: '6000.00',
  estimatedPayoutFee: '250.00',
  ...overrides,
});

const payout = (overrides: Partial<HostPayout> = {}): HostPayout => ({
  id: 'p1',
  kind: 'withdrawal',
  destinationType: 'bank',
  currency: 'KES',
  status: 'settled',
  grossAmount: '20000.00',
  paystackFee: '100.00',
  tukaiFee: '150.00',
  netAmount: '19750.00',
  dateRequested: '2026-09-01T10:00:00Z',
  ...overrides,
});

describe('the earnings section', () => {
  beforeEach(() => {
    summary = earnings();
    payouts = [];
    isSummaryLoading = false;
    arePayoutsLoading = false;
  });

  /**
   * The three balances are not interchangeable: only `available` can be
   * withdrawn now, so they are shown apart and labelled for what they are.
   */
  it('keeps the three balances apart', () => {
    render(<EarningsSection currency="KES" />);

    expect(screen.getByText('Available to withdraw')).toBeInTheDocument();
    expect(screen.getByText('KES 45,000')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByText('KES 15,000')).toBeInTheDocument();
    expect(screen.getByText('Total balance')).toBeInTheDocument();
  });

  it('says that pending money has not settled', () => {
    render(<EarningsSection currency="KES" />);

    expect(screen.getByText('Not settled yet')).toBeInTheDocument();
  });

  it('shows what was taken and what was deducted', () => {
    render(<EarningsSection currency="KES" />);

    expect(screen.getByText('KES 120,000')).toBeInTheDocument();
    expect(screen.getByText('KES 6,000')).toBeInTheDocument();
  });

  it('says so rather than showing zeroes when the earnings fail to load', () => {
    summary = null;
    render(<EarningsSection currency="KES" />);

    expect(screen.getByText('Your earnings could not be loaded.')).toBeInTheDocument();
  });

  it('lists a payout with what actually landed', () => {
    payouts = [payout()];
    render(<EarningsSection currency="KES" />);

    expect(screen.getByText('KES 19,750')).toBeInTheDocument();
    expect(screen.getByText('Paid out')).toBeInTheDocument();
    expect(screen.getByText(/Withdrawal · Bank account/)).toBeInTheDocument();
  });

  it('adds both fees together', () => {
    payouts = [payout()];
    render(<EarningsSection currency="KES" />);

    expect(screen.getByText('Fees KES 250')).toBeInTheDocument();
  });

  // Fees on a payout in flight are an estimate until it settles
  it('marks estimated fees as estimated', () => {
    payouts = [payout({ status: 'processing', feeEstimated: true })];
    render(<EarningsSection currency="KES" />);

    expect(screen.getByText('Est. fees KES 250')).toBeInTheDocument();
    expect(screen.getByText('On its way')).toBeInTheDocument();
  });

  it('reads a paginated answer as well as a bare list', () => {
    payouts = { results: [payout()] };
    render(<EarningsSection currency="KES" />);

    expect(screen.getByText('KES 19,750')).toBeInTheDocument();
  });

  it('says plainly when nothing has been paid out', () => {
    render(<EarningsSection currency="KES" />);

    expect(screen.getByText('No payouts yet')).toBeInTheDocument();
  });

  /**
   * Only money that has settled can be taken out, so there is nothing to offer
   * until there is some.
   */
  it('offers a withdrawal when there is money available', () => {
    render(<EarningsSection currency="KES" />);

    expect(screen.getByRole('button', { name: 'Withdraw' })).toBeInTheDocument();
  });

  it('does not offer one when the available balance is nothing', () => {
    summary = earnings({ availableBalance: '0.00' });
    render(<EarningsSection currency="KES" />);

    expect(screen.queryByRole('button', { name: 'Withdraw' })).not.toBeInTheDocument();
  });
});
