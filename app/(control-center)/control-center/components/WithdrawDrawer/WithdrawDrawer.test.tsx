import React from 'react';

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { PayoutQuote } from '@/types/payment';

import { WithdrawDrawer } from './index';

const withdraw = jest.fn();
let quote: PayoutQuote | null = null;
let quoteSucceeded = true;
let isFetching = false;

jest.mock('@/app/(experiences)/hooks/usePayment', () => ({
  usePayoutQuote: () => ({ data: { success: quoteSucceeded, data: quote }, isFetching }),
  useRequestWithdrawal: () => ({ mutate: withdraw, isPending: false }),
}));

const toast = jest.fn();
jest.mock('@/app/shared/hooks/useToast', () => ({ useToast: () => ({ toast }) }));

const aQuote = (overrides: Partial<PayoutQuote> = {}): PayoutQuote => ({
  currency: 'KES',
  destinationType: 'bank',
  availableBalance: '45000.00',
  requestedAmount: '10000.00',
  paystackTransferFee: '100.00',
  tukaiPayoutFee: '150.00',
  netAmount: '9750.00',
  tukaiCommissionDeducted: '0.00',
  maxPayoutAmount: '45000.00',
  limitMessage: 'You can withdraw up to KES 45,000 today.',
  ...overrides,
});

const renderDrawer = (onClose = jest.fn()) =>
  render(<WithdrawDrawer currency="KES" availableBalance="45000.00" isOpen onClose={onClose} />);

const type = async (amount: string) => userEvent.type(screen.getByLabelText(/How much/), amount);

describe('withdrawing', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    quote = aQuote();
    quoteSucceeded = true;
    isFetching = false;
  });

  it('says how much there is to take', () => {
    renderDrawer();

    expect(screen.getByText(/KES 45,000 available/)).toBeInTheDocument();
  });

  /**
   * The fees are the API's to work out, so what will actually land is shown
   * before anything is committed.
   */
  it('shows the fees and what will land', async () => {
    renderDrawer();

    await type('10000');

    expect(screen.getByText('Transfer fee')).toBeInTheDocument();
    expect(screen.getByText('KES 100')).toBeInTheDocument();
    expect(screen.getByText('You receive')).toBeInTheDocument();
    expect(screen.getByText('KES 9,750')).toBeInTheDocument();
  });

  // The API's own words about its own limit
  it('passes on what the API says about the limit', async () => {
    renderDrawer();

    await type('10000');

    expect(screen.getByText('You can withdraw up to KES 45,000 today.')).toBeInTheDocument();
  });

  it('shows nothing about fees until an amount is entered', () => {
    renderDrawer();

    expect(screen.queryByText('You receive')).not.toBeInTheDocument();
  });

  it('will not withdraw nothing', async () => {
    renderDrawer();

    await userEvent.click(screen.getByRole('button', { name: 'Request withdrawal' }));

    expect(withdraw).not.toHaveBeenCalled();
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Enter how much you want to withdraw.',
    );
  });

  // Checked here so the obvious case needs no round trip
  it('refuses more than is available', async () => {
    renderDrawer();

    await type('90000');
    await userEvent.click(screen.getByRole('button', { name: 'Request withdrawal' }));

    expect(withdraw).not.toHaveBeenCalled();
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'You can withdraw up to KES 45,000 right now.',
    );
  });

  it('fills the field with everything available', async () => {
    renderDrawer();

    await userEvent.click(screen.getByRole('button', { name: 'Withdraw everything available' }));

    expect(screen.getByLabelText(/How much/)).toHaveValue('45000');
  });

  it('asks for the withdrawal in the experience currency', async () => {
    renderDrawer();

    await type('10000');
    await userEvent.click(screen.getByRole('button', { name: 'Request withdrawal' }));

    expect(withdraw).toHaveBeenCalledWith({ amount: '10000', currency: 'KES' }, expect.anything());
  });

  it('says what is on its way once it is requested', async () => {
    const onClose = jest.fn();
    withdraw.mockImplementation((_data, { onSuccess }) => onSuccess());
    renderDrawer(onClose);

    await type('10000');
    await userEvent.click(screen.getByRole('button', { name: 'Request withdrawal' }));

    await waitFor(() =>
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({
          description: 'KES 9,750 is on its way to your active wallet.',
        }),
      ),
    );
    expect(onClose).toHaveBeenCalled();
  });

  it('shows the refusal the API gave', async () => {
    withdraw.mockImplementation((_data, { onError }) =>
      onError(new Error('No active payout account.')),
    );
    renderDrawer();

    await type('10000');
    await userEvent.click(screen.getByRole('button', { name: 'Request withdrawal' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('No active payout account.');
  });

  // A quote that cannot be worked out must not block the withdrawal itself
  it('still allows a withdrawal when the quote fails', async () => {
    quoteSucceeded = false;
    quote = null;
    renderDrawer();

    await type('10000');

    expect(screen.getByText(/The fees could not be worked out/)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Request withdrawal' }));

    expect(withdraw).toHaveBeenCalled();
  });

  it('says it is working the fees out while it is', async () => {
    quote = null;
    isFetching = true;
    renderDrawer();

    await type('10000');

    expect(screen.getByText('Working out the fees…')).toBeInTheDocument();
  });
});
