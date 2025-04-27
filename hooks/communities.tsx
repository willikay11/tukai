import { getInterestBasedCommunities } from '@/services/community';
import { useQuery } from '@tanstack/react-query';

export const useInterestBasedCommunities = (
  {
    page,
    enabled,
    category,
    search,
  }: { page: number; enabled: boolean; category?: string; search?: string } = {
    page: 1,
    enabled: true,
  },
) => {
  return useQuery({
    queryKey: ['communities', page, category, search],
    queryFn: async () => await getInterestBasedCommunities(category, page, 12, search),
    enabled: enabled,
  });
};
