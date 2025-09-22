import { useMutation, useQuery } from '@tanstack/react-query';
import {
  fetchExperience,
  fetchExperiences,
  purchaseExperienceTicket,
  bookmarkExperience,
} from '@/services/experience';
import { useQueryClient } from '@tanstack/react-query';

export const useExperiences = (
  {
    page,
    enabled,
    type,
    category,
    invited = false,
    isPublic = true,
  }: {
    page: number;
    enabled: boolean;
    type?: string;
    category?: string;
    invited?: boolean;
    isPublic?: boolean;
  } = {
    page: 1,
    enabled: true,
    type: 'all',
    invited: false,
    isPublic: true,
  },
) => {
  return useQuery({
    queryKey: ['experiences', page, type, category, invited],
    queryFn: async () => await fetchExperiences(page, 12, type, category, invited, isPublic),
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
    mutationFn: async (data: {
      experienceId: string;
      reservedTickets: { ticketId: string; quantity: number }[];
    }) => await purchaseExperienceTicket(data),
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
