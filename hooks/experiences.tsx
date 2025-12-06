import { useMutation, useQuery } from '@tanstack/react-query';
import {
  fetchExperience,
  fetchExperiences,
  purchaseExperienceTicket,
  bookmarkExperience,
  ExperiencesQueryParams,
} from '@/services/experience';
import { useQueryClient } from '@tanstack/react-query';
import { PurchaserDetails } from '@/types/purchaser';

export const useExperiences = (params: ExperiencesQueryParams, enabled: boolean) => {
  return useQuery({
    queryKey: [
      'experiences',
      params.page,
      params.page_size,
      params.reserved_by,
      params.category,
      params.invited,
      params.date,
    ],
    queryFn: async () => await fetchExperiences(params),
    enabled: enabled,
  });
};

export const useFetchSingleExperience = (id: string) => {
  return useQuery({
    queryKey: ['experience', id],
    queryFn: async () => await fetchExperience(id),
    enabled: !!id,
  });
};

export const usePurchaseExperienceTicket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: PurchaserDetails) => await purchaseExperienceTicket(data),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['experience'] });
    },
  });
};

export const useBookmarkExperience = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => await bookmarkExperience(id),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['experience'] });
    },
  });
};
