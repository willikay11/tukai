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
