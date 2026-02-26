import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  ExperiencesQueryParams,
  bookmarkExperience,
  createExperience,
  fetchExperience,
  fetchExperiences,
  purchaseExperienceTicket,
} from '@/services/experience';
import { PurchaserDetails } from '@/types/purchaser';
import { CreateExperience } from '@/types/experience';

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
      params.bookmarked,
      params.hosted_by,
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

export const useCreateExperience = () => {
  return useMutation({
    mutationKey: ['createExperience'],
    mutationFn: async (data: CreateExperience) => await createExperience(data),
  });
};
