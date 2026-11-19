import { Wallet } from '@/types/payment';

import {
  isCompleteWallet,
  matchingPayoutAccount,
  payoutAccountLabel,
  savedPayoutAccounts,
} from './payoutAccounts';

const wallet = (extra: Partial<Wallet>): Wallet =>
  ({ id: 'w', walletType: 'phone', isActive: false, country: 'KE', ...extra }) as Wallet;

const mpesa = wallet({ id: 'mp', phone: '+254712345815', accountHolderName: 'Wanjiku Maina' });
const kcb = wallet({
  id: 'kcb',
  walletType: 'bank',
  bankName: 'KCB Bank',
  accountNumber: '1234560417',
  isActive: true,
});

describe('saved payout accounts', () => {
  it('names an account the way Withdraw does', () => {
    expect(payoutAccountLabel(mpesa)).toBe('M-Pesa ending 815');
    expect(payoutAccountLabel(kcb)).toBe('KCB Bank ending 0417');
  });

  it('lists only complete accounts, the active one first', () => {
    const halfDone = wallet({ id: 'half', phone: '+2547' });

    expect(isCompleteWallet(halfDone)).toBe(false);
    expect(savedPayoutAccounts([mpesa, halfDone, kcb]).map((w) => w.id)).toEqual(['kcb', 'mp']);
  });

  it('finds the saved account a new one duplicates', () => {
    expect(
      matchingPayoutAccount([mpesa, kcb], { walletType: 'phone', number: '0712 345 815' }),
    ).toBe(mpesa);
    expect(matchingPayoutAccount([mpesa, kcb], { walletType: 'bank', number: '1234560417' })).toBe(
      kcb,
    );
    // Same digits, different method: not a duplicate
    expect(
      matchingPayoutAccount([mpesa, kcb], { walletType: 'bank', number: '254712345815' }),
    ).toBeUndefined();
  });
});
