import { useMutation, useQuery } from '@tanstack/react-query';
import { fetchExperience, fetchExperiences, purchaseExperienceTicket } from '@/services/experience';
import { useQueryClient } from '@tanstack/react-query';

export const useExperiences = (
  { page, enabled, category, invited = false }: { page: number; enabled: boolean; category?: string; invited?: boolean } = {
    page: 1,
    enabled: true,
    category: 'all',
    invited: false,
  },
) => {
  return useQuery({
    queryKey: ['experiences', page, category, invited],
    queryFn: async () => await fetchExperiences(page, 12, category, invited),
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
