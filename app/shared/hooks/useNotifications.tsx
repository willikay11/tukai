import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  fetchNotifications,
  fetchUnreadNotificationCount,
  markAllNotificationsRead,
  markNotificationRead,
} from '@/services/comm';

const NOTIFICATIONS = ['notifications'];
const UNREAD = ['notifications', 'unread-count'];

export const useNotifications = (enabled = true) =>
  useQuery({
    queryKey: NOTIFICATIONS,
    queryFn: async () => await fetchNotifications({ page: 1, page_size: 50 }),
    enabled,
  });

/**
 * Just the number, for the badge. Its own endpoint, so the nav does not pull
 * the whole list to find out whether to show a dot.
 */
export const useUnreadNotificationCount = (enabled = true) =>
  useQuery({
    queryKey: UNREAD,
    queryFn: async () => await fetchUnreadNotificationCount(),
    enabled,
  });

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) => markNotificationRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS });
      queryClient.invalidateQueries({ queryKey: UNREAD });
    },
  });
};

export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => markAllNotificationsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS });
      queryClient.invalidateQueries({ queryKey: UNREAD });
    },
  });
};
