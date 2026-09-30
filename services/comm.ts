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

/**
 * Notifications.
 *
 * The list is paginated and ordered newest first by the API. The unread count
 * has its own endpoint so the nav can ask for the number without pulling the
 * whole list.
 */
export const fetchNotifications = async (params: { page?: number; page_size?: number } = {}) => {
  try {
    const api = await apiWithToken();
    const response = await api.get('/v1/comms/notifications/', { params });

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
      message: parseApiError(error.response?.data, 'Could not load your notifications'),
    };
  }
};

export const fetchUnreadNotificationCount = async () => {
  try {
    const api = await apiWithToken();
    const response = await api.get('/v1/comms/notifications/unread-count/');

    return {
      status: response.status,
      success: true,
      data: parseSnakeToCamel(response.data),
    };
  } catch (error: any) {
    // A failed count is not worth reporting: the badge simply does not show
    console.error('API Error:', error.response?.data || error.message);

    return { status: error.response?.status || 500, success: false, data: { count: 0 } };
  }
};

export const markNotificationRead = async (notificationId: string) => {
  try {
    const api = await apiWithToken();
    const response = await api.patch(`/v1/comms/notifications/${notificationId}/read/`);

    return { status: response.status, success: true, data: parseSnakeToCamel(response.data) };
  } catch (error: any) {
    console.error('API Error:', error.response?.data || error.message);

    throw new Error(parseApiError(error.response?.data, 'Could not mark this as read'));
  }
};

export const markAllNotificationsRead = async () => {
  try {
    const api = await apiWithToken();
    const response = await api.patch('/v1/comms/notifications/read-all/');

    return { status: response.status, success: true, data: parseSnakeToCamel(response.data) };
  } catch (error: any) {
    console.error('API Error:', error.response?.data || error.message);

    throw new Error(parseApiError(error.response?.data, 'Could not mark these as read'));
  }
};
