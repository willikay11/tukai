import { Wallet } from '@/types/payment';

/** How a wallet reads in a list: the account it pays into. */
export const walletLabel = (wallet: Wallet): string =>
  wallet.walletType === 'phone'
    ? (wallet.phone ?? 'Mobile money')
    : [wallet.bankName, wallet.accountNumber].filter(Boolean).join(' · ') || 'Bank account';

export const walletHolder = (wallet: Wallet): string =>
  wallet.walletType === 'phone' ? 'Mobile money' : (wallet.accountHolderName ?? 'Bank account');

/**
 * Exactly one wallet takes the payouts. The API's flag is the authority; where
 * nothing is flagged and there is only one wallet, that one is plainly it.
 */
export const activeWallet = (wallets: Wallet[]): Wallet | undefined =>
  wallets.find((wallet) => wallet.isActive) ?? (wallets.length === 1 ? wallets[0] : undefined);
