import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createPromoCode,
  deletePromoCode,
  fetchMyPromoCodes,
  updatePromoCode,
} from '@/services/promoCode';
import { CreatePromoCode, UpdatePromoCode } from '@/types/promoCode';

const KEY = ['promo-codes', 'mine'];

export const useMyPromoCodes = (enabled = true) =>
  useQuery({
    queryKey: KEY,
    queryFn: async () => await fetchMyPromoCodes({ page: 1, page_size: 100 }),
    enabled,
  });

export const useCreatePromoCode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePromoCode) => createPromoCode(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
};

export const useUpdatePromoCode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdatePromoCode }) =>
      updatePromoCode(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
};

export const useDeletePromoCode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deletePromoCode(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
};
