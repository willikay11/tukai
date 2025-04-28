import { parseSnakeToCamel } from '@/utils/parseSnakeToCamel';
import api from './apiService';

export async function getInterestBasedCommunities(
  category?: string,
  page: number = 1,
  perPage: number = 12,
  search?: string,
) {
  try {
    const queryParams = new URLSearchParams();
    if (page) queryParams.append('page', page.toString());
    if (perPage) queryParams.append('page_size', perPage.toString());
    if (search) queryParams.append('search', search);
    if (category) queryParams.append('categories', category);
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
  console.log('Fetching community:', communityId);
  try {
    const response = await api.get(`/v1/communities/${communityId}`);
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
