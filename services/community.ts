import { getAuthSession } from '@/lib/auth';
import { ApiResponse } from '@/types/apiResponse';
import { CommunityPostsQueryParams, CreateCommunity } from '@/types/community';
import { assertValidImageFiles } from '@/utils/images';
import { parseApiError } from '@/utils/parseApiError';
import { parseSnakeToCamel } from '@/utils/parseSnakeToCamel';

import { api, apiWithToken } from './apiService';

export async function getCommunities(
  category?: string[],
  page: number = 1,
  perPage: number = 6,
  search?: string,
  showUpComingExperiences?: boolean,
  recommendedCommunities?: boolean,
  popularCommunities?: boolean,
  following?: boolean,
  createdBy?: string,
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
    if (createdBy) queryParams.append('created_by', createdBy);
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
      message: parseApiError(error.response?.data, 'An unexpected error occurred'),
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
      message: parseApiError(error.response?.data, 'An unexpected error occurred'),
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
    throw new Error(parseApiError(error.response?.data, 'An unexpected error occurred'));
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
    throw new Error(parseApiError(error.response?.data, 'An unexpected error occurred'));
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
      message: parseApiError(error.response?.data, 'An unexpected error occurred'),
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
      message: parseApiError(error.response?.data, 'An unexpected error occurred'),
    };
  }
}

export async function createCommunityPhotos(communityId: string, photos: File[]) {
  try {
    const api = await apiWithToken();
    await assertValidImageFiles(photos);
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
      message: parseApiError(error.response?.data, 'An unexpected error occurred'),
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
      await assertValidImageFiles(data.newPhotos);
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
      message: parseApiError(error.response?.data, 'An unexpected error occurred'),
    };
  }
}

/**
 * Opens a verification application for a community. Proof-of-ownership
 * documents hang off this, and it is what a place-ownership claim is reviewed
 * against.
 *
 * Fails if a pending or under-review application already exists, so a caller
 * that only needs "there is an open application" can treat that 400 as success.
 */
export async function submitCommunityVerification(communityId: string): Promise<ApiResponse> {
  try {
    const api = await apiWithToken();
    const response = await api.post(`/v1/communities/${communityId}/verification/`, {});

    return { status: response.status, success: true, data: parseSnakeToCamel(response.data) };
  } catch (error: any) {
    console.error('API Error:', error.response?.data || error.message);
    throw {
      status: error.response?.status || 500,
      success: false,
      message: parseApiError(error.response?.data, 'Could not start verification'),
    };
  }
}

/** One supporting document — PDF, JPEG or PNG, up to 10 MB. */
export async function uploadVerificationDocument(
  communityId: string,
  documentType: string,
  file: File,
  notes?: string,
): Promise<ApiResponse> {
  try {
    const api = await apiWithToken();
    const formData = new FormData();
    formData.append('document_type', documentType);
    formData.append('file', file);
    if (notes) formData.append('notes', notes);

    const response = await api.post(
      `/v1/communities/${communityId}/verification/documents/`,
      formData,
      { headers: { 'Content-Type': undefined } },
    );

    return { status: response.status, success: true, data: parseSnakeToCamel(response.data) };
  } catch (error: any) {
    console.error('API Error:', error.response?.data || error.message);
    throw {
      status: error.response?.status || 500,
      success: false,
      message: parseApiError(error.response?.data, 'Could not upload this document'),
    };
  }
}
