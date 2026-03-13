import { createBankWallet, createPhoneWallet, fetchWallets } from "@/services/payment";
import { CreateBankWallet, CreatePhoneWallet } from "@/types/payment";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";

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