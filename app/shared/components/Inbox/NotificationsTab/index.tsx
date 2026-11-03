'use client';

import { useId } from 'react';

import { IconComponent } from '@/app/shared/components/Icons';
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from '@/app/shared/hooks/useNotifications';
import { useToast } from '@/app/shared/hooks/useToast';
import { cn } from '@/lib/utils';
import {
  AppNotification,
  inboxStamp,
  notificationHref,
  notificationList,
  splitByRead,
} from '@/types/notification';

const NotificationList = ({
  labelledBy,
  notifications,
  onOpen,
}: {
  labelledBy: string;
  notifications: AppNotification[];
  onOpen: (notification: AppNotification) => void;
}) => (
  // Bleeds to the panel's edges, so the dividers and the hover run full width
  <ul aria-labelledby={labelledBy} className="-mx-6 flex flex-col">
    {notifications.map((notification) => {
      const when = inboxStamp(notification.dateCreated);

      return (
        <li key={notification.id}>
          {/* Text only - the section and the text colour carry read state */}
          <button
            type="button"
            onClick={() => onOpen(notification)}
            className="flex w-full flex-col gap-1 border-b border-surface-muted px-6 py-3.5 text-left transition-colors hover:bg-surface-row"
          >
            <span
              className={cn(
                'text-pretty text-[15.5px] leading-[1.5]',
                notification.isRead ? 'text-ink-muted' : 'text-gray-800',
              )}
            >
              {notification.content}
            </span>
            {when && <span className="text-[13.5px] text-ink-muted">{when}</span>}
          </button>
        </li>
      );
    })}
  </ul>
);

const RowsSkeleton = () => (
  <div aria-hidden="true" className="-mx-6 flex flex-col">
    {[0, 1, 2].map((row) => (
      <div key={row} className="flex flex-col gap-2 border-b border-surface-muted px-6 py-3.5">
        <div className="h-4 w-4/5 animate-pulse rounded-full bg-surface" />
        <div className="h-3 w-24 animate-pulse rounded-full bg-surface" />
      </div>
    ))}
  </div>
);

/**
 * What happened, as the inbox's Notifications tab: New, then Older, both
 * newest first, with Mark all as read held at the bottom while anything is
 * unread.
 *
 * Opening a row is reading it; `onOpen` then gets where it goes, or null for a
 * notification with nowhere to go. `onMarkedAll` is for moving focus, since
 * the button that had it disappears.
 */
export const NotificationsTab = ({
  onOpen,
  onMarkedAll,
}: {
  onOpen?: (href: string | null) => void;
  onMarkedAll?: () => void;
}) => {
  const newId = useId();
  const olderId = useId();
  const { toast } = useToast();
  const { data: response, isLoading } = useNotifications();
  const { mutate: markRead } = useMarkNotificationRead();
  const { mutate: markAllRead } = useMarkAllNotificationsRead();

  const { unread, read } = splitByRead(notificationList(response?.data));

  const open = (notification: AppNotification) => {
    if (!notification.isRead) {
      markRead(notification.id, {
        onError: (error: Error) =>
          toast({
            title: 'Could not mark this as read',
            description: error.message,
            variant: 'destructive',
          }),
      });
    }

    onOpen?.(notificationHref(notification));
  };

  const markAll = () => {
    markAllRead(undefined, {
      onError: (error: Error) =>
        toast({
          title: 'Could not mark these as read',
          description: error.message,
          variant: 'destructive',
        }),
    });
    onMarkedAll?.();
  };

  if (isLoading) return <RowsSkeleton />;

  if (response && !response.success) {
    return (
      <p role="alert" className="text-[13.5px] leading-[1.45] text-danger">
        {response.message ?? 'Could not load your notifications'}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {unread.length > 0 && (
        <>
          <h3 id={newId} className="text-19 font-bold tracking-[-0.2px] text-gray-800">
            New notifications
          </h3>
          <NotificationList labelledBy={newId} notifications={unread} onOpen={open} />
        </>
      )}

      {read.length > 0 && (
        <>
          <h3 id={olderId} className="mt-5 text-19 font-bold tracking-[-0.2px] text-gray-800">
            Older notifications
          </h3>
          <NotificationList labelledBy={olderId} notifications={read} onOpen={open} />
        </>
      )}

      {/* Held at the bottom of the panel while rows scroll under it */}
      <div className="pointer-events-none sticky bottom-5 z-[2] mt-4 flex justify-center">
        {unread.length > 0 ? (
          <button
            type="button"
            onClick={markAll}
            // The white ring parts it from the rows scrolling under it
            className="pointer-events-auto inline-flex h-[52px] items-center gap-2 whitespace-nowrap rounded-full bg-lime pl-[22px] pr-[26px] text-15 font-semibold text-brand-ink shadow-[0_0_0_6px_#FFFFFF,0_12px_28px_rgba(1,51,52,.18)] transition-colors hover:bg-lime-dark active:scale-[0.97]"
          >
            <IconComponent iconName="TickDouble02Icon" size={22} color="currentColor" />
            Mark all as read
          </button>
        ) : (
          <span
            role="status"
            className="pointer-events-auto inline-flex h-[52px] items-center gap-2 whitespace-nowrap rounded-full bg-white pl-[22px] pr-[26px] text-15 text-gray-800 shadow-[0_12px_28px_rgba(1,51,52,.14)]"
          >
            <IconComponent iconName="ThumbsUpIcon" size={22} color="currentColor" />
            No new notifications
          </span>
        )}
      </div>
    </div>
  );
};
