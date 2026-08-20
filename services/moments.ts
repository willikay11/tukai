import { apiWithToken } from '@/services/apiService';
import { ApiResponse } from '@/types/apiResponse';
import { parseApiError } from '@/utils/parseApiError';
import { parseSnakeToCamel } from '@/utils/parseSnakeToCamel';

export type MomentsQueryParams = {
  page?: number;
  page_size?: number;
};

export async function fetchMoments(params: MomentsQueryParams = {}): Promise<ApiResponse> {
  try {
    // /v1/moments/ is authenticated — it 401s without a bearer token, unlike
    // the public experiences and places lists
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
