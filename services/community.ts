import { getSession } from 'next-auth/react';

import { parseSnakeToCamel } from '@/utils/parseSnakeToCamel';

import { api } from './apiService';

export async function getInterestBasedCommunities(
  category?: string,
  page: number = 1,
  perPage: number = 12,
  search?: string,
  showUpComingExperiences?: boolean,
  recommendedCommunities?: boolean,
  popularCommunities?: boolean,
) {
  try {
    const queryParams = new URLSearchParams();
    if (page) queryParams.append('page', page.toString());
    if (perPage) queryParams.append('page_size', perPage.toString());
    if (search) queryParams.append('search', search);
    if (category) queryParams.append('category', category);
    if (showUpComingExperiences) queryParams.append('upcoming_experiences', 'true');
    if (recommendedCommunities) queryParams.append('recommended', 'true');
    if (popularCommunities) queryParams.append('popular', 'true');
    const response = await api.get(`/v1/communities/?${queryParams.toString()}`);
    return {
      status: response.status,
      success: true,
      data: parseSnakeToCamel(response.data),
    };
  } catch (error: any) {
    console.error('API Error:', error.response?.data || error.message);

    return {
      status: error.response?.status || 500,
      success: false,
      message: error.response?.data?.message || 'An unexpected error occurred',
    };
  }
}

export async function fetchCommunity(communityId: string) {
  try {
    const session = await getSession();
    const response = await api.get(`/v1/communities/${communityId}`, {
      headers: {
        Authorization: `Bearer ${session?.user?.accessToken}`,
      },
    });
    return {
      status: response.status,
      success: true,
      data: parseSnakeToCamel(response.data),
    };
  } catch (error: any) {
    console.error('API Error:', error.response?.data || error.message);

    return {
      status: error.response?.status || 500,
      success: false,
      message: error.response?.data?.message || 'An unexpected error occurred',
    };
  }
}
