import { api } from '@/services/apiService';
import { ApiResponse } from '@/types/apiResponse';
import { parseSnakeToCamel } from '@/utils/parseSnakeToCamel';

export async function fetchSubscriptionPlans(): Promise<ApiResponse> {
  try {
    const response = await api.get(`/v1/subscriptions/plans`);

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
