import { useQuery } from '@tanstack/react-query';
import { fetchExperiences } from '@/services/experience';

export const useExperiences = ({ page, enabled }: { page: number; enabled: boolean } = { page: 1, enabled: true }) => {
  return useQuery({
    queryKey: ['experiences', page],
    queryFn: async () => await fetchExperiences(page),
    enabled: enabled,
  });
};
