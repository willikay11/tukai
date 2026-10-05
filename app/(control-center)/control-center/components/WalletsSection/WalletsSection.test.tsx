import React from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Wallet } from '@/types/payment';

import { WalletsSection } from './index';
import { activeWallet, walletHolder, walletLabel } from './wallets';

const makeActive = jest.fn();
let wallets: Wallet[] = [];
let isLoading = false;

jest.mock('@/app/(experiences)/hooks/usePayment', () => ({
  useGetWallets: () => ({ data: { data: wallets }, isLoading }),
  useSetActiveWallet: () => ({ mutate: makeActive, isPending: false, variables: undefined }),
}));

const toast = jest.fn();
jest.mock('@/app/shared/hooks/useToast', () => ({ useToast: () => ({ toast }) }));

const phone = (overrides: Partial<Wallet> = {}): Wallet =>
  ({
    id: 'w1',
    user: 'u1',
    walletType: 'phone',
    phone: '+254712345678',
    country: 'KE',
    isActive: true,
    dateCreated: '2026-01-01T00:00:00Z',
    ...overrides,
  }) as Wallet;

const bank = (overrides: Partial<Wallet> = {}): Wallet =>
  ({
    id: 'w2',
    user: 'u1',
    walletType: 'bank',
    bankName: 'KCB',
    accountNumber: '1234567890',
    accountHolderName: 'Wanjiku Maina',
    country: 'KE',
    isActive: false,
    dateCreated: '2026-01-01T00:00:00Z',
  }) as Wallet;

describe('walletLabel', () => {
  it('names a mobile wallet by its number', () => {
    expect(walletLabel(phone())).toBe('+254712345678');
  });

  it('names a bank account by bank and number', () => {
    expect(walletLabel(bank())).toBe('KCB · 1234567890');
  });

  it('copes with a bank wallet missing its details', () => {
    expect(walletLabel({ ...bank(), bankName: undefined, accountNumber: undefined })).toBe(
      'Bank account',
    );
  });

  it('says who holds the account', () => {
    expect(walletHolder(bank())).toBe('Wanjiku Maina');
    expect(walletHolder(phone())).toBe('Mobile money');
  });
});

/**
 * Exactly one wallet takes the payouts, and nothing in the app called
 * `set-active` - so a host with two accounts could not choose.
 */
describe('activeWallet', () => {
  it('is the one the API flagged', () => {
    expect(activeWallet([bank(), phone()])?.id).toBe('w1');
  });

  // Nothing flagged and only one wallet: that one is plainly it
  it('is the only one there is when none is flagged', () => {
    expect(activeWallet([{ ...phone(), isActive: false }])?.id).toBe('w1');
  });

  it('is nobody when several are unflagged', () => {
    expect(activeWallet([{ ...phone(), isActive: false }, bank()])).toBeUndefined();
  });
});

describe('the payout accounts section', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    wallets = [phone(), bank()];
    isLoading = false;
  });

  it('marks the account that takes the payouts', () => {
    render(<WalletsSection />);

    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('+254712345678')).toBeInTheDocument();
  });

  it('offers to switch to another account', async () => {
    render(<WalletsSection />);

    await userEvent.click(screen.getByRole('button', { name: 'Make active' }));

    expect(makeActive).toHaveBeenCalledWith('w2', expect.anything());
  });

  it('says where the money will go now', async () => {
    makeActive.mockImplementation((_id, { onSuccess }) => onSuccess());
    render(<WalletsSection />);

    await userEvent.click(screen.getByRole('button', { name: 'Make active' }));

    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({ description: 'Payouts now go to KCB · 1234567890.' }),
    );
  });

  it('reports a refusal rather than looking like it switched', async () => {
    makeActive.mockImplementation((_id, { onError }) => onError(new Error('Wallet unverified')));
    render(<WalletsSection />);

    await userEvent.click(screen.getByRole('button', { name: 'Make active' }));

    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({ description: 'Wallet unverified', variant: 'destructive' }),
    );
  });

  it('says plainly when there is no account yet', () => {
    wallets = [];
    render(<WalletsSection />);

    expect(
      screen.getByText('No payout account yet. Add one and your earnings can be withdrawn to it.'),
    ).toBeInTheDocument();
  });

  it('offers to add one only where the caller can handle it', () => {
    render(<WalletsSection />);
    expect(screen.queryByRole('button', { name: /Add account/ })).not.toBeInTheDocument();
  });
});
