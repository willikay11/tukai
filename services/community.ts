import { getAuthSession } from '@/lib/auth';
import { CommunityPostsQueryParams, CreateCommunity } from '@/types/community';
import { parseCamelToSnake, parseSnakeToCamel } from '@/utils/parseSnakeToCamel';

import { api, apiWithToken } from './apiService';

export async function getInterestBasedCommunities(
  category?: string[],
  page: number = 1,
  perPage: number = 6,
  search?: string,
  showUpComingExperiences?: boolean,
  recommendedCommunities?: boolean,
  popularCommunities?: boolean,
  following?: boolean,
) {
  try {
    const queryParams = new URLSearchParams();
    if (page) queryParams.append('page', page.toString());
    if (perPage) queryParams.append('page_size', perPage.toString());
    if (search) queryParams.append('search', search);
    category?.forEach((cat) => queryParams.append('category', cat));
    if (showUpComingExperiences) queryParams.append('upcoming_experiences', 'true');
    if (recommendedCommunities) queryParams.append('recommended', 'true');
    if (popularCommunities) queryParams.append('popular', '4');
    if (following) queryParams.append('following', 'true');
    queryParams.append('status', 'published');

    const api = await apiWithToken();

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
    const session: any = await getAuthSession();

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

export async function joinCommunity(communityId: string) {
  try {
    const api = await apiWithToken();

    const response = await api.post(`/v1/communities/${communityId}/request-to-join/`, {
      community_id: communityId,
    });
    return {
      status: response.status,
      success: true,
      data: parseSnakeToCamel(response.data),
    };
  } catch (error: any) {
    console.error('API Error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'An unexpected error occurred');
  }
}

export async function joinCommunityWithToken(communityId: string, token?: string) {
  try {
    const api = await apiWithToken();

    const response = await api.post(`/v1/communities/${communityId}/members/join-via-invite/`, {
      token: token,
    });

    return {
      status: response.status,
      success: true,
      data: parseSnakeToCamel(response.data),
    };
  } catch (error: any) {
    throw new Error(error?.response?.data?.error || 'An unexpected error occurred');
  }
}

export async function fetchCommunityPosts(params: CommunityPostsQueryParams) {
  try {
    const api = await apiWithToken();
    const response = await api.get(`/v1/communities/posts/`, { params });

    return {
      status: response.status,
      success: true,
      data: parseSnakeToCamel(response.data),
    };
  } catch (error: any) {
    console.error('API Error:', error.response?.data || error.message);

    throw {
      status: error.response?.status || 500,
      success: false,
      message: error.response?.data?.message || 'An unexpected error occurred',
    };
  }
}

export async function fetchCommunityPostPhotos(communityId: string) {
  try {
    const api = await apiWithToken();
    const response = await api.get(`/v1/communities/${communityId}/post-photos/`);

    return {
      status: response.status,
      success: true,
      data: parseSnakeToCamel(response.data),
    };
  } catch (error: any) {
    console.error('API Error:', error.response?.data || error.message);

    throw {
      status: error.response?.status || 500,
      success: false,
      message: error.response?.data?.message || 'An unexpected error occurred',
    };
  }
}

export async function createCommunityPhotos(communityId: string, photos: File[]) {
  try {
    const api = await apiWithToken();
    const formData = new FormData();
    photos.forEach((photo) => {
      formData.append('new_photos', photo);
    });
    const response = await api.post(`/v1/communities/${communityId}/photos/`, formData, {
      headers: {
        'Content-Type': undefined,
      },
    });

    return {
      status: response.status,
      success: true,
      data: parseSnakeToCamel(response.data),
    };
  } catch (error: any) {
    console.error('API Error:', error.response?.data || error.message);

    throw {
      status: error.response?.status || 500,
      success: false,
      message: error.response?.data?.message || 'An unexpected error occurred',
    };
  }
}

export async function createCommunity(data: CreateCommunity) {
  try {
    const api = await apiWithToken();
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('google_map_place_id', data.googleMapPlaceId);
    data.invitedMemberIds.forEach((memberId) => {
      formData.append('invited_members_ids', memberId);
    });
    data.invitedCommunityIds.forEach((communityId) => {
      formData.append('invited_communities_ids', communityId);
    });
    data.invitedEmails.forEach((email) => {
      formData.append('invited_emails', email);
    });
    data.categoriesIds.forEach((categoryId) => {
      formData.append('categories_ids', categoryId);
    });
    formData.append('is_public', data.isPublic.toString());
    if (data.status) {
      formData.append('status', data.status);
    }

    if (data.newPhotos && data.newPhotos.length > 0) {
      data.newPhotos.forEach((photo, index) => {
        const fileName = photo.name || `image_${Date.now()}_${index}`;
        formData.append('new_photos', photo, fileName);
      });
    }
    
    const response = await api.post(`/v1/communities/`, formData, {
      headers: {
        'Content-Type': undefined,
      },
    });

    return {
      status: response.status,
      success: true,
      data: parseSnakeToCamel(response.data),
    };
  } catch (error: any) {
    console.error('API Error:', error.response?.data || error.message);

    throw {
      status: error.response?.status || 500,
      success: false,
      message: error.response?.data?.message || 'An unexpected error occurred',
    };
  }
}
