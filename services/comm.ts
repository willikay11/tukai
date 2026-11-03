import { getSession } from 'next-auth/react';

import { NotificationPreferences } from '@/types/notification';
import { parseApiError } from '@/utils/parseApiError';
import { parseCamelToSnake, parseSnakeToCamel } from '@/utils/parseSnakeToCamel';

import { api, apiWithToken } from './apiService';

/**
 * The one email/push preferences record every account has.
 *
 * There is no "create" endpoint - the record already exists by the time a
 * reader can open Settings - only a list of (always exactly one) and an
 * update by that record's own id.
 */
export const fetchEmailPreferences = async () => {
  try {
    const client = await apiWithToken();
    const response = await client.get('/v1/comms/email-preferences/');
    const results = parseSnakeToCamel(response.data)?.results ?? [];

    return {
      status: response.status,
      success: true,
      data: results[0] as NotificationPreferences | undefined,
    };
  } catch (error: any) {
    console.error('API Error:', error.response?.data || error.message);

    return {
      status: error.response?.status || 500,
      success: false,
      message: parseApiError(error.response?.data, 'Could not load your notification settings'),
    };
  }
};

export const updateEmailPreferences = async (
  id: string,
  changes: Partial<Omit<NotificationPreferences, 'id' | 'email'>>,
) => {
  try {
    const client = await apiWithToken();
    const response = await client.patch(
      `/v1/comms/email-preferences/${id}/`,
      parseCamelToSnake(changes),
    );

    return { status: response.status, success: true, data: parseSnakeToCamel(response.data) };
  } catch (error: any) {
    console.error('API Error:', error.response?.data || error.message);

    throw new Error(
      parseApiError(error.response?.data, 'Could not save your notification settings'),
    );
  }
};

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

/**
 * Messages.
 *
 * There are no threads on the API: this is every message the reader is party
 * to, so the conversations are worked out from it. `between` fetches one
 * conversation directly, which is what an open conversation polls.
 */
export const fetchMessages = async (
  params: { search?: string; page?: number; page_size?: number } = {},
) => {
  try {
    const api = await apiWithToken();
    const response = await api.get('/v1/comms/messages/', { params });

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
      message: parseApiError(error.response?.data, 'Could not load your messages'),
    };
  }
};

/**
 * One conversation, every page of it. The schema names the two people sender
 * and recipient without saying whether it is one direction or both, so it is
 * asked both ways and the answers merged by id.
 */
export const fetchConversation = async (myId: string, personId: string) => {
  const pageOf = async (sender: string, recipient: string) => {
    const api = await apiWithToken();
    const messages: unknown[] = [];

    // A long conversation is several pages; the cap is a guard against a
    // `next` that never ends
    for (let page = 1; page <= 20; page += 1) {
      const response = await api.get(`/v1/comms/messages/between/${sender}/${recipient}/`, {
        params: { page, page_size: 100 },
      });
      const data = parseSnakeToCamel(response.data);
      const results = Array.isArray(data) ? data : (data?.results ?? []);

      messages.push(...results);
      if (Array.isArray(data) || !data?.next || results.length === 0) break;
    }

    return messages;
  };

  try {
    const [mine, theirs] = await Promise.all([pageOf(myId, personId), pageOf(personId, myId)]);
    const byId = new Map<string, unknown>();
    [...mine, ...theirs].forEach((message) => byId.set((message as { id: string }).id, message));

    return { status: 200, success: true, data: Array.from(byId.values()) };
  } catch (error: any) {
    console.error('API Error:', error.response?.data || error.message);

    return {
      status: error.response?.status || 500,
      success: false,
      message: parseApiError(error.response?.data, 'Could not load this conversation'),
    };
  }
};

export const markMessageRead = async (messageId: string) => {
  try {
    const api = await apiWithToken();
    const response = await api.patch(`/v1/comms/messages/${messageId}/read/`);

    return { status: response.status, success: true, data: parseSnakeToCamel(response.data) };
  } catch (error: any) {
    console.error('API Error:', error.response?.data || error.message);

    throw new Error(parseApiError(error.response?.data, 'Could not mark this as read'));
  }
};

/**
 * Deletes the conversation from the reader's side only; the other person
 * still sees it.
 */
export const deleteConversation = async (senderId: string, recipientId: string) => {
  try {
    const api = await apiWithToken();
    const response = await api.delete(`/v1/comms/messages/between/${senderId}/${recipientId}/`);

    return { status: response.status, success: true, data: parseSnakeToCamel(response.data) };
  } catch (error: any) {
    console.error('API Error:', error.response?.data || error.message);

    throw new Error(parseApiError(error.response?.data, 'Could not delete this conversation'));
  }
};
