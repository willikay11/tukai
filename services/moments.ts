import { apiWithToken } from '@/services/apiService';
import { ApiResponse } from '@/types/apiResponse';
import { parseApiError } from '@/utils/parseApiError';
import { parseSnakeToCamel } from '@/utils/parseSnakeToCamel';

export type MomentsQueryParams = {
  page?: number;
  page_size?: number;
  // Moments posted in one community
  community?: string;
  // ⚠️ Moments carry a `place`, but nothing in staging has one set, so this
  // filter could not be verified against real data
  place?: string;
  // Moments posted at one experience
  experience?: string;
};

export type CreateMoment = {
  title: string;
  description: string;
  // Whatever the moment was posted at — all optional, and the API takes any
  // combination
  experienceId?: string;
  placeId?: string;
  communityId?: string;
  photos: File[];
};

/**
 * Posts a moment. `title` and `description` are both required by the
 * serializer even though the composer asks one question — see the composer for
 * how the title is derived.
 */
export async function createMoment(data: CreateMoment): Promise<ApiResponse> {
  try {
    const api = await apiWithToken();
    const formData = new FormData();

    formData.append('title', data.title);
    formData.append('description', data.description);
    if (data.experienceId) formData.append('experience_id', data.experienceId);
    if (data.placeId) formData.append('place_id', data.placeId);
    if (data.communityId) formData.append('community_id', data.communityId);
    data.photos.forEach((photo, index) =>
      formData.append('new_photos', photo, photo.name || `moment_${Date.now()}_${index}`),
    );

    const response = await api.post('/v1/moments/', formData, {
      headers: { 'Content-Type': undefined },
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
      message: parseApiError(error.response?.data, 'Could not share this moment'),
    };
  }
}

export async function fetchMoments(params: MomentsQueryParams = {}): Promise<ApiResponse> {
  try {
    // Public: the list reads without a bearer token. It used to 401, which is
    // why this note said otherwise. The instance still sends a token when
    // there is a session, so `is_liked` comes back for a signed-in reader.
    const api = await apiWithToken();
    const response = await api.get('/v1/moments/', { params });

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

export type MomentCommentsQueryParams = {
  page?: number;
  page_size?: number;
};

// Shared error shape for every call below
const momentsError = (error: any) => {
  console.error('API Error:', error.response?.data || error.message);
  return {
    status: error.response?.status || 500,
    success: false,
    message: parseApiError(error.response?.data, 'An unexpected error occurred'),
  };
};

export async function fetchMomentComments(
  momentId: string,
  params: MomentCommentsQueryParams = {},
): Promise<ApiResponse> {
  try {
    const api = await apiWithToken();
    const response = await api.get(`/v1/moments/${momentId}/comments/`, { params });

    return { status: response.status, success: true, data: parseSnakeToCamel(response.data) };
  } catch (error: any) {
    throw momentsError(error);
  }
}

export async function addMomentComment(momentId: string, content: string): Promise<ApiResponse> {
  try {
    const api = await apiWithToken();
    const response = await api.post(`/v1/moments/${momentId}/comments/`, { content });

    return { status: response.status, success: true, data: parseSnakeToCamel(response.data) };
  } catch (error: any) {
    throw momentsError(error);
  }
}

// The like endpoints are toggles: 201 means it is now liked, 204 means the
// existing like was removed. There is no is_liked on the read serializers, so
// this status code is the only signal we get.
export async function toggleMomentLike(momentId: string): Promise<{ isLiked: boolean }> {
  try {
    const api = await apiWithToken();
    const response = await api.post(`/v1/moments/${momentId}/like/`);

    return { isLiked: response.status === 201 };
  } catch (error: any) {
    throw momentsError(error);
  }
}

export async function toggleCommentLike(
  momentId: string,
  commentId: string,
): Promise<{ isLiked: boolean }> {
  try {
    const api = await apiWithToken();
    const response = await api.post(`/v1/moments/${momentId}/comments/${commentId}/like/`);

    return { isLiked: response.status === 201 };
  } catch (error: any) {
    throw momentsError(error);
  }
}

export async function fetchFlagReasons(): Promise<ApiResponse> {
  try {
    const api = await apiWithToken();
    const response = await api.get('/v1/moments/flag-reasons/');

    return { status: response.status, success: true, data: parseSnakeToCamel(response.data) };
  } catch (error: any) {
    throw momentsError(error);
  }
}

// 201 = newly reported, 204 = this user had already reported it
export async function flagMoment(momentId: string, flagReasonId: string): Promise<ApiResponse> {
  try {
    const api = await apiWithToken();
    const response = await api.post(`/v1/moments/${momentId}/flag/`, {
      flag_reason_id: flagReasonId,
    });

    return { status: response.status, success: true, data: parseSnakeToCamel(response.data) };
  } catch (error: any) {
    throw momentsError(error);
  }
}

export async function flagComment(
  momentId: string,
  commentId: string,
  flagReasonId: string,
): Promise<ApiResponse> {
  try {
    const api = await apiWithToken();
    const response = await api.post(`/v1/moments/${momentId}/comments/${commentId}/flag/`, {
      flag_reason_id: flagReasonId,
    });

    return { status: response.status, success: true, data: parseSnakeToCamel(response.data) };
  } catch (error: any) {
    throw momentsError(error);
  }
}
