import { Wallet } from '@/types/payment';

const digits = (value?: string | null) => String(value ?? '').replace(/\D/g, '');

/**
 * A saved wallet that can take payouts as it is: an M-Pesa number with 9+
 * digits, or a bank account number with 4+ digits.
 */
export const isCompleteWallet = (wallet: Wallet): boolean =>
  wallet.walletType === 'bank'
    ? digits(wallet.accountNumber).length >= 4
    : digits(wallet.phone).length >= 9;

/**
 * The host's saved payout accounts, the active one (where payouts go now)
 * first and the rest in the order the API lists them.
 */
export const savedPayoutAccounts = (wallets: Wallet[]): Wallet[] => {
  const complete = wallets.filter(isCompleteWallet);
  return [
    ...complete.filter((wallet) => wallet.isActive),
    ...complete.filter((wallet) => !wallet.isActive),
  ];
};

/** "M-Pesa ending 815" or "KCB Bank ending 0417", as Withdraw names them. */
export const payoutAccountLabel = (wallet: Wallet): string =>
  wallet.walletType === 'bank'
    ? `${wallet.bankName || 'Bank'} ending ${digits(wallet.accountNumber).slice(-4)}`
    : `M-Pesa ending ${digits(wallet.phone).slice(-3)}`;

/**
 * The saved account a new one duplicates - same method and same number - so
 * it is picked instead of being added twice.
 */
export const matchingPayoutAccount = (
  wallets: Wallet[],
  draft: { walletType: Wallet['walletType']; number: string },
): Wallet | undefined => {
  const number = digits(draft.number);
  if (!number) return undefined;

  return wallets.find((wallet) =>
    wallet.walletType !== draft.walletType
      ? false
      : wallet.walletType === 'bank'
        ? digits(wallet.accountNumber) === number
        : // Phones compare without the country code: "0712..." and "+254712..."
          digits(wallet.phone).slice(-9) === number.slice(-9),
  );
};
