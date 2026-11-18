import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createBankWallet,
  createPhoneWallet,
  fetchEarningsSummary,
  fetchHostIncome,
  fetchPayoutQuote,
  fetchPayouts,
  fetchWallets,
  patchBankWallet,
  patchPhoneWallet,
  requestWithdrawal,
  sendWalletOtp,
  setActiveWallet,
  verifyWalletOtp,
} from '@/services/payment';
import {
  CreateBankWallet,
  CreatePhoneWallet,
  UpdateBankWallet,
  UpdatePhoneWallet,
} from '@/types/payment';

export const useGetWallets = () => {
  return useQuery({
    queryKey: ['wallets'],
    queryFn: async () => await fetchWallets(),
  });
};

export const useCreatePhoneWallet = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['createPhoneWallet'],
    mutationFn: async (data: CreatePhoneWallet) => await createPhoneWallet(data),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
    },
  });
};

export const usePatchPhoneWallet = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['patchPhoneWallet'],
    mutationFn: async (data: UpdatePhoneWallet) => await patchPhoneWallet(data),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
    },
  });
};

export const useCreateBankWallet = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['createBankWallet'],
    mutationFn: async (data: CreateBankWallet) => await createBankWallet(data),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
    },
  });
};

export const usePatchBankWallet = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['patchBankWallet'],
    mutationFn: async (data: UpdateBankWallet) => await patchBankWallet(data),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
    },
  });
};

/**
 * What the host has earned. Its own query rather than part of the wallets one:
 * the balances move with every sale, the wallets themselves hardly ever change.
 */
export const useEarningsSummary = (enabled = true) =>
  useQuery({
    queryKey: ['earnings-summary'],
    queryFn: async () => await fetchEarningsSummary(),
    enabled,
  });

/** Every payout the host has been sent. */
/** The host's income ledger: ticket sales, refunds and corrections (DEV-372). */
export const useHostIncome = (enabled = true) =>
  useQuery({
    queryKey: ['host-income'],
    queryFn: async () => await fetchHostIncome({ page: 1, page_size: 50 }),
    enabled,
  });

export const usePayouts = (enabled = true) =>
  useQuery({
    queryKey: ['payouts'],
    queryFn: async () => await fetchPayouts({ page: 1, page_size: 50 }),
    enabled,
  });

/**
 * The fees on a withdrawal of this amount.
 *
 * Kept as a query rather than a mutation so it follows the amount as it is
 * typed, and held back until there is an amount worth quoting.
 */
export const usePayoutQuote = (amount: string, currency = 'KES', walletId?: string) =>
  useQuery({
    queryKey: ['payout-quote', amount, currency, walletId ?? null],
    queryFn: async () =>
      await fetchPayoutQuote({ amount, currency, ...(walletId ? { wallet_id: walletId } : {}) }),
    enabled: Number(amount) > 0,
  });

export const useRequestWithdrawal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { amount: string; currency: string }) => await requestWithdrawal(data),
    onSuccess: () => {
      // The balance and the payout list both move on a withdrawal
      queryClient.invalidateQueries({ queryKey: ['earnings-summary'] });
      queryClient.invalidateQueries({ queryKey: ['payouts'] });
    },
  });
};

export const useSetActiveWallet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (walletId: string) => await setActiveWallet(walletId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['wallets'] }),
  });
};

/** Texts a verification code to an M-Pesa wallet's number. */
export const useSendWalletOtp = () =>
  useMutation({
    mutationKey: ['sendWalletOtp'],
    mutationFn: async (walletId: string) => await sendWalletOtp(walletId),
  });

/** Checks the code; on success the wallet comes back verified. */
export const useVerifyWalletOtp = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['verifyWalletOtp'],
    mutationFn: async ({ walletId, otp }: { walletId: string; otp: string }) =>
      await verifyWalletOtp(walletId, otp),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
    },
  });
};
