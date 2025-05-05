import { parseSnakeToCamel } from '@/utils/parseSnakeToCamel';
import { ApiResponse } from '@/types/apiResponse';
import { api, apiWithToken } from '@/services/apiService';
import { getSession } from 'next-auth/react';

export async function fetchExperiences(
  page: number,
  perPage: number,
  category?: string,
  invited?: boolean,
  search?: string,
): Promise<ApiResponse> {
  try {
    const queryParams = new URLSearchParams();
    if (page) queryParams.append('page', page.toString());
    if (perPage) queryParams.append('page_size', perPage.toString());
    if (search) queryParams.append('search', search);
    if (category === 'reserved') {
      const session = await getSession();
      queryParams.append('reserved_by', session?.user?.id || '');
    }
    if (category === 'saved') {
      queryParams.append('bookmarked', "true");
    }
    if (category === 'hosting') {
      queryParams.append('hosted_by', 'true');
    }
    if (invited) {
      queryParams.append('invited', 'true');
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
