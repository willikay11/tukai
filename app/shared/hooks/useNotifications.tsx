import { QueryClient, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  fetchNotifications,
  fetchUnreadNotificationCount,
  markAllNotificationsRead,
  markNotificationRead,
} from '@/services/comm';
import { AppNotification, notificationList, withRead } from '@/types/notification';

const NOTIFICATIONS = ['notifications'];
const UNREAD = ['notifications', 'unread-count'];

type ListResponse = Awaited<ReturnType<typeof fetchNotifications>>;
type CountResponse = Awaited<ReturnType<typeof fetchUnreadNotificationCount>>;

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

/**
 * Reads the cache as read before the server answers, so the row moves to
 * Older and both badges drop at once, as the design has it. Hands back what
 * was there, to put back if the server refuses.
 */
const markReadInCache = async (
  queryClient: QueryClient,
  isTarget: (notification: AppNotification) => boolean,
) => {
  await queryClient.cancelQueries({ queryKey: NOTIFICATIONS });

  const list = queryClient.getQueryData<ListResponse>(NOTIFICATIONS);
  const count = queryClient.getQueryData<CountResponse>(UNREAD);
  const newlyRead = notificationList(list?.data).filter((one) => !one.isRead && isTarget(one));

  if (list?.data) {
    queryClient.setQueryData<ListResponse>(NOTIFICATIONS, {
      ...list,
      data: withRead(list.data, isTarget),
    });
  }

  if (count?.data && newlyRead.length > 0) {
    queryClient.setQueryData<CountResponse>(UNREAD, {
      ...count,
      data: { ...count.data, count: Math.max(0, Number(count.data.count ?? 0) - newlyRead.length) },
    });
  }

  return { list, count };
};

const restoreCache = (
  queryClient: QueryClient,
  previous?: { list?: ListResponse; count?: CountResponse },
) => {
  if (previous?.list) queryClient.setQueryData(NOTIFICATIONS, previous.list);
  if (previous?.count) queryClient.setQueryData(UNREAD, previous.count);
};

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) => markNotificationRead(notificationId),
    onMutate: (notificationId) => markReadInCache(queryClient, (one) => one.id === notificationId),
    onError: (_error, _id, previous) => restoreCache(queryClient, previous),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS });
      queryClient.invalidateQueries({ queryKey: UNREAD });
    },
  });
};

export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => markAllNotificationsRead(),
    onMutate: async () => {
      const previous = await markReadInCache(queryClient, () => true);

      // Everything is read, whatever was counted past the first page
      const count = queryClient.getQueryData<CountResponse>(UNREAD);
      if (count?.data)
        queryClient.setQueryData(UNREAD, { ...count, data: { ...count.data, count: 0 } });

      return previous;
    },
    onError: (_error, _variables, previous) => restoreCache(queryClient, previous),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS });
      queryClient.invalidateQueries({ queryKey: UNREAD });
    },
  });
};
