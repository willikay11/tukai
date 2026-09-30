'use client';

import moment from 'moment';

import { IconComponent } from '@/app/shared/components/Icons';
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from '@/app/shared/hooks/useNotifications';
import { useToast } from '@/app/shared/hooks/useToast';
import { Button } from '@/components/ui/button';
import { NoData } from '@/components/ui/noData';
import { cn } from '@/lib/utils';
import { AppNotification, notificationIcon, splitByRead } from '@/types/notification';

const NotificationRow = ({
  notification,
  onRead,
  isBusy,
}: {
  notification: AppNotification;
  onRead: () => void;
  isBusy: boolean;
}) => (
  <div
    className={cn(
      'flex items-start gap-3 border-b border-gray-100 py-3 last:border-b-0',
      !notification.isRead && 'bg-surface-brand/40',
    )}
  >
    <span
      aria-hidden="true"
      className={cn(
        'mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full',
        notification.isRead ? 'bg-surface text-ink-subtle' : 'bg-surface-brand text-brand',
      )}
    >
      <IconComponent iconName={notificationIcon(notification)} size={18} color="currentColor" />
    </span>

    <div className="min-w-0 flex-1">
      <p
        className={cn(
          'text-sm leading-relaxed',
          notification.isRead ? 'text-gray-600' : 'font-medium text-gray-900',
        )}
      >
        {notification.content}
      </p>
      {notification.dateCreated && (
        <p className="mt-0.5 text-13 text-ink-subtle">
          {moment(notification.dateCreated).fromNow()}
        </p>
      )}
    </div>

    {!notification.isRead && (
      <button
        type="button"
        onClick={onRead}
        disabled={isBusy}
        aria-label="Mark as read"
        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-ink-subtle transition-colors hover:bg-surface hover:text-brand disabled:opacity-50"
      >
        <IconComponent iconName="CheckmarkCircle02Icon" size={20} color="currentColor" />
      </button>
    )}
  </div>
);

/**
 * What has happened, newest first, with what is new kept apart from what has
 * been seen — the canvas's two groups.
 */
export const NotificationsTab = () => {
  const { toast } = useToast();
  const { data: response, isLoading } = useNotifications();
  const { mutate: markRead, isPending, variables } = useMarkNotificationRead();
  const { mutate: markAllRead, isPending: isMarkingAll } = useMarkAllNotificationsRead();

  const payload = response?.data;
  const notifications: AppNotification[] = Array.isArray(payload)
    ? payload
    : (payload?.results ?? []);
  const { unread, read } = splitByRead(notifications);

  if (isLoading) {
    return <div className="h-40 animate-pulse rounded-2xl bg-gray-100" />;
  }

  if (notifications.length === 0) {
    return (
      <div className="py-12">
        <NoData message="Nothing to catch up on" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {unread.length > 0 && (
        <section>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-bold text-gray-900">New</h2>
            <Button
              type="button"
              variant="ghost"
              isLoading={isMarkingAll}
              onClick={() =>
                markAllRead(undefined, {
                  onError: (error: Error) =>
                    toast({
                      title: 'Could not mark these as read',
                      description: error.message,
                      variant: 'destructive',
                    }),
                })
              }
              className="text-brand"
            >
              Mark all as read
            </Button>
          </div>

          <div>
            {unread.map((notification) => (
              <NotificationRow
                key={notification.id}
                notification={notification}
                isBusy={isPending && variables === notification.id}
                onRead={() =>
                  markRead(notification.id, {
                    onError: (error: Error) =>
                      toast({
                        title: 'Could not mark this as read',
                        description: error.message,
                        variant: 'destructive',
                      }),
                  })
                }
              />
            ))}
          </div>
        </section>
      )}

      {read.length > 0 && (
        <section>
          <h2 className="text-base font-bold text-gray-900">Earlier</h2>
          <div>
            {read.map((notification) => (
              <NotificationRow
                key={notification.id}
                notification={notification}
                isBusy={false}
                onRead={() => {}}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
