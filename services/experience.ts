import { parseSnakeToCamel } from '@/utils/parseSnakeToCamel';
import { ApiResponse } from '@/types/apiResponse';
import api from '@/services/apiService';

export async function fetchExperiences(): Promise<ApiResponse> {
  try {
    const response = await api.get('/v1/experiences/');

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

export async function fetchExperience(id: string): Promise<ApiResponse> {
  try {
    console.log(id);
    const response = await api.get(`/v1/experiences/${id}`);

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
