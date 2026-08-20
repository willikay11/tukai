import { useMutation, useQuery } from '@tanstack/react-query';

import {
  createCommunity,
  createCommunityPhotos,
  fetchCommunityPostPhotos,
  fetchCommunityPosts,
  getCommunities,
  joinCommunity,
  joinCommunityWithToken,
} from '@/services/community';
import { CommunityPostsQueryParams, CreateCommunity } from '@/types/community';

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
    createdBy,
  }: {
    page: number;
    enabled: boolean;
    category?: string[];
    search?: string;
    showUpComingExperiences?: boolean;
    recommendedCommunities?: boolean;
    popularCommunities?: boolean;
    following?: boolean;
    createdBy?: string;
  } = {
    page: 1,
    enabled: true,
  },
) => {
  return useQuery({
    // Every flag that changes the request must be in the key. Without the
    // boolean flags, a popular/recommended/following query shares a cache entry
    // with a plain one and they serve each other's results.
    queryKey: [
      'communities',
      page,
      category,
      search,
      createdBy,
      showUpComingExperiences,
      recommendedCommunities,
      popularCommunities,
      following,
    ],
    queryFn: async () =>
      await getCommunities(
        category,
        page,
        12,
        search,
        showUpComingExperiences,
        recommendedCommunities,
        popularCommunities,
        following,
        createdBy,
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

export const useCommunityPostPhotos = (communityId: string, enabled: boolean) => {
  return useQuery({
    queryKey: ['communityPostPhotos', communityId],
    queryFn: async () => await fetchCommunityPostPhotos(communityId),
    enabled: enabled,
  });
};

export const useCreateCommunity = () => {
  return useMutation({
    mutationKey: ['createCommunity'],
    mutationFn: async (data: CreateCommunity) => await createCommunity(data),
  });
};

export const useCreateCommunityPhotos = () => {
  return useMutation({
    mutationKey: ['createCommunityPhotos'],
    mutationFn: async ({ communityId, photos }: { communityId: string; photos: File[] }) =>
      await createCommunityPhotos(communityId, photos),
  });
};
