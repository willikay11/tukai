import React from 'react';

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { PayoutQuote, Wallet } from '@/types/payment';

import { WithdrawDrawer } from './index';

const withdraw = jest.fn();
let quote: PayoutQuote | null = null;
let quoteSucceeded = true;
let isFetching = false;
let wallets: Wallet[] = [];

jest.mock('@/app/(experiences)/hooks/usePayment', () => ({
  usePayoutQuote: () => ({ data: { success: quoteSucceeded, data: quote }, isFetching }),
  useRequestWithdrawal: () => ({ mutate: withdraw, isPending: false }),
  useGetWallets: () => ({ data: { data: wallets } }),
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

const aPhoneWallet = (overrides: Partial<Wallet> = {}): Wallet => ({
  id: 'wal_1',
  user: 'user_1',
  walletType: 'phone',
  phone: '254712345815',
  country: 'KE',
  isActive: true,
  dateCreated: '2026-01-01T00:00:00Z',
  ...overrides,
});

const renderDrawer = (props: Partial<React.ComponentProps<typeof WithdrawDrawer>> = {}) =>
  render(
    <WithdrawDrawer
      currency="KES"
      availableBalance="45000.00"
      pending={6439.8}
      isOpen
      onClose={jest.fn()}
      {...props}
    />,
  );

const type = async (amount: string) => userEvent.type(screen.getByLabelText('Amount'), amount);

describe('withdrawing', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    quote = aQuote();
    quoteSucceeded = true;
    isFetching = false;
    wallets = [aPhoneWallet()];
  });

  it('says how much there is to take, with two decimals', () => {
    renderDrawer();

    expect(screen.getByText('KES 45,000.00')).toBeInTheDocument();
  });

  it('says what is still clearing', () => {
    renderDrawer();

    expect(screen.getByText(/KES 6,439.80 is still clearing/)).toBeInTheDocument();
  });

  it('offers quick amounts above their thresholds', () => {
    renderDrawer();

    expect(screen.getByRole('button', { name: 'KES 5,000' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'KES 10,000' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'All available' })).toBeInTheDocument();
  });

  it('hides a chip once available does not clear its threshold', () => {
    renderDrawer({ availableBalance: '7000.00' });

    expect(screen.queryByRole('button', { name: 'KES 10,000' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'KES 5,000' })).toBeInTheDocument();
  });

  it('fills the amount from a chip and marks it pressed', async () => {
    renderDrawer();

    await userEvent.click(screen.getByRole('button', { name: 'All available' }));

    expect(screen.getByLabelText('Amount')).toHaveValue('45000');
    expect(screen.getByRole('button', { name: 'All available' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('still shows the input when there is nothing to withdraw, but disables the button', () => {
    renderDrawer({ availableBalance: '50.00' });

    expect(screen.getByLabelText('Amount')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Withdraw' })).toBeDisabled();
  });

  /**
   * The design reference assumes no fee at withdrawal; the API actually
   * charges a real Paystack transfer fee, so the quote preview stays.
   */
  it('shows the fees and what will land', async () => {
    renderDrawer();

    await type('10000');

    expect(screen.getByText('Transfer fee')).toBeInTheDocument();
    expect(screen.getByText('KES 100.00')).toBeInTheDocument();
    expect(screen.getByText('You receive')).toBeInTheDocument();
    expect(screen.getByText('KES 9,750.00')).toBeInTheDocument();
  });

  it('shows nothing about fees until an amount is entered', () => {
    renderDrawer();

    expect(screen.queryByText('You receive')).not.toBeInTheDocument();
  });

  it('shows the destination it will send to', () => {
    renderDrawer();

    expect(screen.getByText('M-Pesa ending 815')).toBeInTheDocument();
    expect(
      screen.getByText('M-Pesa withdrawals usually arrive within a few minutes.'),
    ).toBeInTheDocument();
  });

  it('shows a bank destination with its holder name', () => {
    wallets = [
      {
        id: 'wal_2',
        user: 'user_1',
        walletType: 'bank',
        bankName: 'Equity Bank',
        accountNumber: '00112233344821',
        accountHolderName: 'Wanjiku Maina',
        country: 'KE',
        isActive: true,
        dateCreated: '2026-01-01T00:00:00Z',
      },
    ];
    renderDrawer();

    expect(screen.getByText('Equity Bank ending 4821')).toBeInTheDocument();
    expect(screen.getByText('Wanjiku Maina')).toBeInTheDocument();
    expect(screen.getByText('Bank transfers arrive in 1 to 2 working days.')).toBeInTheDocument();
  });

  it('will not withdraw nothing', async () => {
    renderDrawer();

    await userEvent.click(screen.getByRole('button', { name: 'Withdraw' }));

    expect(withdraw).not.toHaveBeenCalled();
    expect(await screen.findByRole('alert')).toHaveTextContent('Enter how much to withdraw.');
  });

  it('refuses below the minimum', async () => {
    renderDrawer();

    await type('50');
    await userEvent.click(screen.getByRole('button', { name: /Withdraw/ }));

    expect(withdraw).not.toHaveBeenCalled();
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'The smallest withdrawal is KES 100.',
    );
  });

  // Checked here so the obvious case needs no round trip
  it('refuses more than is available', async () => {
    renderDrawer();

    await type('90000');
    await userEvent.click(screen.getByRole('button', { name: /Withdraw/ }));

    expect(withdraw).not.toHaveBeenCalled();
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'You can withdraw up to KES 45,000.00 right now.',
    );
  });

  it('labels the button with the amount once one is entered', async () => {
    renderDrawer();

    await type('10000');

    expect(screen.getByRole('button', { name: 'Withdraw KES 10,000.00' })).toBeInTheDocument();
  });

  it('asks for the withdrawal in the experience currency', async () => {
    renderDrawer();

    await type('10000');
    await userEvent.click(screen.getByRole('button', { name: /Withdraw/ }));

    expect(withdraw).toHaveBeenCalledWith({ amount: '10000', currency: 'KES' }, expect.anything());
  });

  it('says what is on its way to its destination once requested', async () => {
    const onClose = jest.fn();
    withdraw.mockImplementation((_data, { onSuccess }) => onSuccess());
    renderDrawer({ onClose });

    await type('10000');
    await userEvent.click(screen.getByRole('button', { name: /Withdraw/ }));

    await waitFor(() =>
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({
          description: 'KES 10,000.00 is on its way to M-Pesa ending 815.',
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
    await userEvent.click(screen.getByRole('button', { name: /Withdraw/ }));

    expect(await screen.findByRole('alert')).toHaveTextContent('No active payout account.');
  });

  // A quote that cannot be worked out must not block the withdrawal itself
  it('still allows a withdrawal when the quote fails', async () => {
    quoteSucceeded = false;
    quote = null;
    renderDrawer();

    await type('10000');

    expect(screen.getByText(/The fees could not be worked out/)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /Withdraw/ }));

    expect(withdraw).toHaveBeenCalled();
  });

  it('says it is working the fees out while it is', async () => {
    quote = null;
    isFetching = true;
    renderDrawer();

    await type('10000');

    expect(screen.getByText('Working out the fees…')).toBeInTheDocument();
  });

  it('closes from the close button', async () => {
    const onClose = jest.fn();
    renderDrawer({ onClose });

    await userEvent.click(screen.getByRole('button', { name: 'Close' }));

    expect(onClose).toHaveBeenCalled();
  });
});
