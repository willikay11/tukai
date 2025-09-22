import { parseSnakeToCamel } from '@/utils/parseSnakeToCamel';
import { ApiResponse } from '@/types/apiResponse';
import { api, apiWithToken } from '@/services/apiService';
import { getSession } from 'next-auth/react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function fetchExperiences(
  page: number,
  perPage: number,
  type?: string,
  category?: string,
  invited?: boolean,
  isPublic?: boolean,
  search?: string,
): Promise<ApiResponse> {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('status', 'published');
    if (page) queryParams.append('page', page.toString());
    if (perPage) queryParams.append('page_size', perPage.toString());
    if (search) queryParams.append('search', search);
    if (type === 'reserved') {
      const session = await getSession();
      queryParams.append('reserved_by', session?.user?.id || '');
    }
    if (type === 'saved') {
      queryParams.append('bookmarked', 'true');
    }
    if (type === 'hosting') {
      queryParams.append('hosted_by', 'true');
    }

    if (category) {
      queryParams.append('category', category);
    }
    if (invited) {
      queryParams.append('invited', 'true');
    }
    if (isPublic) {
      queryParams.append('is_public', 'true');
    } else {
      queryParams.append('is_public', 'false');
    }

    const response = await api.get(`/v1/experiences/?${queryParams.toString()}`);

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
    // const session = await getServerSession(authOptions);

    // const axiosInstance = await apiWithToken(session?.user?.accessToken);
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

export async function purchaseExperienceTicket(data: {
  reservedTickets: { ticketId: string; quantity: number }[];
}): Promise<ApiResponse> {
  try {
    const response = await api.post(`/v1/experiences/ticket-purchases/`, {
      ticket_purchases: data.reservedTickets.map((ticket) => ({
        ticket_id: ticket.ticketId,
        quantity: ticket.quantity,
      })),
    });

    console.log('response: ', response);

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

export async function bookmarkExperience(id: string): Promise<ApiResponse> {
  try {
    const axiosInstance = await apiWithToken();
    const response = await axiosInstance.post(`/v1/experiences/${id}/bookmark/`);

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
