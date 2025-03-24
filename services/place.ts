import { parseSnakeToCamel } from '@/utils/parseSnakeToCamel';
import api from '@/services/apiService';
import { ApiResponse } from '@/types/apiResponse';

export async function fetchPlaces(
  categoryId?: string,
  page = 1,
  perPage = 12,
): Promise<ApiResponse> {
  try {
    const res = await api.get(
      `/v1/places/?categories=${categoryId}&page=${page}&page_size=${perPage}`,
    );

    return {
      status: res.status,
      success: true,
      data: parseSnakeToCamel(res.data),
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

export async function fetchPlace(id?: string): Promise<ApiResponse> {
  try {
    const res = await api.get(`/v1/places/${id}`);

    return {
      status: res.status,
      success: true,
      data: parseSnakeToCamel(res.data),
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

export async function fetchPlaceCategories(): Promise<ApiResponse> {
  try {
    const res = await api.get('/v1/places/categories/?page_size=100');

    return {
      status: res.status,
      success: true,
      data: parseSnakeToCamel(res.data),
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

export async function fetchPlaceProperties(id: string): Promise<ApiResponse> {
  try {
    const res = await api.get(`/v1/places/${id}/properties`);

    return {
      status: res.status,
      success: true,
      data: parseSnakeToCamel(res.data),
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

export async function fetchPlaceSocialLinks(id: string): Promise<ApiResponse> {
  try {
    const res = await api.get(`/v1/places/${id}/social-links`);

    return {
      status: res.status,
      success: true,
      data: parseSnakeToCamel(res.data),
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

export async function fetchPlaceReviews(id: string): Promise<ApiResponse> {
  try {
    const res = await api.get(`/v1/places/${id}/reviews/`);

    return {
      status: res.status,
      success: true,
      data: parseSnakeToCamel(res.data),
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

export async function fetchPlaceReviewComments(id: string, reviewId: string): Promise<ApiResponse> {
  try {
    const res = await api.get(`/v1/places/${id}/reviews/${reviewId}/comments/`);

    return {
      status: res.status,
      success: true,
      data: parseSnakeToCamel(res.data),
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

export async function createPlaceReviewComment(
  id: string,
  reviewId: string,
  data: any,
): Promise<ApiResponse> {
  try {
    const res = await api.post(`/v1/places/${id}/reviews/${reviewId}/comments/`, data);

    return {
      status: res.status,
      success: true,
      data: parseSnakeToCamel(res.data),
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

export async function likePlaceReviewComment(
  id: string,
  reviewId: string,
  commentId?: string,
  data?: any,
): Promise<ApiResponse> {
  try {
    const res = await api.post(
      `/v1/places/${id}/reviews/${reviewId}/comments/${commentId}/like/`,
      data,
    );

    return {
      status: res.status,
      success: true,
      data: parseSnakeToCamel(res.data),
    };
  } catch (error: any) {
    console.error('API Error:', error.response?.data || error.message);

    return {
      status: error.response?.status || 500,
      success: false,
    };
  }
}

export async function likePlaceReview(
  id: string,
  reviewId: string,
  data: any,
): Promise<ApiResponse> {
  try {
    const res = await api.post(`/v1/places/${id}/reviews/${reviewId}/like/`, data);

    return {
      status: res.status,
      success: true,
      data: parseSnakeToCamel(res.data),
    };
  } catch (error: any) {
    console.error('API Error:', error.response?.data || error.message);

    return {
      status: error.response?.status || 500,
      success: false,
    };
  }
}

export async function bookmarkPlace(id: string, data: any): Promise<ApiResponse> {
  try {
    const res = await api.post(`/v1/places/${id}/bookmark/`, data);

    return {
      status: res.status,
      success: true,
      data: parseSnakeToCamel(res.data),
    };
  } catch (error: any) {
    console.error('API Error:', error.response?.data || error.message);

    return {
      status: error.response?.status || 500,
      success: false,
    };
  }
}

export async function unbookmarkPlace(id: string, data: any): Promise<ApiResponse> {
  try {
    const res = await api.delete(`/v1/places/${id}/unbookmark/`, { data });

    return {
      status: res.status,
      success: true,
      data: parseSnakeToCamel(res.data),
    };
  } catch (error: any) {
    console.error('API Error:', error.response?.data || error.message);

    return {
      status: error.response?.status || 500,
      success: false,
    };
  }
}

export async function createPlaceReview(id: string, data: any): Promise<ApiResponse> {
  try {
    const res = await api.post(`/v1/places/${id}/reviews/`, data);

    return {
      status: res.status,
      success: true,
      data: parseSnakeToCamel(res.data),
    };
  } catch (error: any) {
    console.error('API Error:', error.response?.data || error.message);

    return {
      status: error.response?.status || 500,
      success: false,
    };
  }
}

export async function uploadPlaceReviewImages(
  id: string,
  reviewId: string,
  data: any,
): Promise<ApiResponse> {
  try {
    
    const res = await api.post(`/v1/places/${id}/reviews/${reviewId}/photos/`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return {
      status: res.status,
      success: true,
      data: parseSnakeToCamel(res.data),
    };
  } catch (error: any) {
    console.error('API Error:', error.response?.data || error.message);

    return {
      status: error.response?.status || 500,
      success: false,
    };
  }
}
