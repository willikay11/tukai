import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createBankWallet,
  createPhoneWallet,
  fetchWallets,
  patchBankWallet,
  patchPhoneWallet,
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
