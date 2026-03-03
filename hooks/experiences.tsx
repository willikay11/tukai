import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  ExperiencesQueryParams,
  bookmarkExperience,
  createExperience,
  createExperienceTicket,
  deleteExperienceTicket,
  fetchExperience,
  fetchExperiences,
  purchaseExperienceTicket,
  updateExperience,
  updateExperienceTicket,
} from '@/services/experience';
import { CreateExperience, CreateExperienceTicket } from '@/types/experience';
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
      params.bookmarked,
      params.hosted_by,
    ],
    queryFn: async () => await fetchExperiences(params),
    enabled: enabled,
  });
};

export const useFetchSingleExperience = (id: string, withAuth: boolean = false) => {
  return useQuery({
    queryKey: ['experience', id],
    queryFn: async () => await fetchExperience(id, withAuth),
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

export const useUpdateExperience = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['updateExperience', id],
    mutationFn: async (data: CreateExperience) => await updateExperience(id, data),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['experience', id] });
    },
  });
};

export const useCreateExperienceTicket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['createExperienceTicket'],
    mutationFn: async (data: CreateExperienceTicket) => await createExperienceTicket(data),
    onSettled: () => {
      // Invalidate experience query to refetch updated experience details
      queryClient.invalidateQueries({ queryKey: ['experience'] });
    },
  });
};

export const useUpdateExperienceTicket = (ticketId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['updateExperienceTicket', ticketId],
    mutationFn: async (data: CreateExperienceTicket) =>
      await updateExperienceTicket(ticketId, data),
    onSettled: () => {
      // Invalidate experience query to refetch updated experience details
      queryClient.invalidateQueries({ queryKey: ['experience'] });
    },
  });
};

export const useDeleteExperienceTicket = (ticketId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['deleteExperienceTicket', ticketId],
    mutationFn: async () => await deleteExperienceTicket(ticketId),
    onSettled: () => {
      // Invalidate experience query to refetch updated experience details
      queryClient.invalidateQueries({ queryKey: ['experience'] });
    },
  });
};
