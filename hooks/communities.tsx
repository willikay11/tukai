import { getInterestBasedCommunities } from '@/services/community';
import { useQuery } from '@tanstack/react-query';

export const useGetCommunities = (
  {
    page,
    enabled,
    category,
    search,
    showUpComingExperiences,
    recommendedCommunities,
    popularCommunities,
  }: {
    page: number;
    enabled: boolean;
    category?: string;
    search?: string;
    showUpComingExperiences?: boolean;
    recommendedCommunities?: boolean;
    popularCommunities?: boolean;
  } = {
    page: 1,
    enabled: true,
  },
) => {
  return useQuery({
    queryKey: ['communities', page, category, search],
    queryFn: async () =>
      await getInterestBasedCommunities(
        category,
        page,
        12,
        search,
        showUpComingExperiences,
        recommendedCommunities,
        popularCommunities,
      ),
    enabled: enabled,
  });
};
