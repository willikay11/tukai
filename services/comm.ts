import { getSession } from 'next-auth/react';

import { parseApiError } from '@/utils/parseApiError';
import { parseSnakeToCamel } from '@/utils/parseSnakeToCamel';

import { api, apiWithToken } from './apiService';

export const sendMessage = async ({
  content,
  recipientId,
}: {
  content: string;
  recipientId: string;
}) => {
  try {
    const api = await apiWithToken();
    const session = await getSession();
    const senderId = session?.user?.id;

    const response = await api.post('/v1/comms/messages/', {
      sender_id: senderId,
      recipient_id: recipientId,
      content: content,
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
};

export const unsubscribe = async ({ token }: { token: string }) => {
  try {
    const response = await api.post('/v1/comms/unsubscribe/', {
      token,
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
      message:
        error.response?.data?.message ||
        'Failed to unsubscribe. Please try again or contact support.',
    };
  }
};
