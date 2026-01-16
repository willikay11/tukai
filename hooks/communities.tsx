import { useMutation, useQuery } from '@tanstack/react-query';

import {
  fetchCommunityPosts,
  getInterestBasedCommunities,
  joinCommunity,
  joinCommunityWithToken,
} from '@/services/community';
import { CommunityPostsQueryParams } from '@/types/community';

export const useGetCommunities = (
  {
    page,
    enabled,
    category,
    search,
    showUpComingExperiences,
    recommendedCommunities,
    popularCommunities,
    following,
  }: {
    page: number;
    enabled: boolean;
    category?: string[];
    search?: string;
    showUpComingExperiences?: boolean;
    recommendedCommunities?: boolean;
    popularCommunities?: boolean;
    following?: boolean;
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
        following,
      ),
    enabled: enabled,
  });
};

export const useJoinCommunity = () => {
  return useMutation({
    mutationKey: ['joinCommunity'],
    mutationFn: async (communityId: string) => await joinCommunity(communityId),
  });
};

export const useJoinCommunityViaInvite = () => {
  return useMutation({
    mutationKey: ['joinCommunityViaInvite'],
    mutationFn: async ({ communityId, token }: { communityId: string; token: string }) =>
      await joinCommunityWithToken(communityId, token),
  });
};

export const useCommunityPosts = (params: CommunityPostsQueryParams, enabled: boolean) => {
  return useQuery({
    queryKey: [
      'communityPosts',
      params.page,
      params.page_size,
      params.author,
      params.is_liked,
      params.page,
    ],
    queryFn: async () => await fetchCommunityPosts(params),
    enabled: enabled,
  });
};
