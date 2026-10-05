import { LinkedUser } from '@/types/user';

/**
 * Something that happened which the reader should know about.
 *
 * `category` is a free-form object on the wire and `push_category` is the
 * enumerated one, so the enumerated one is what anything here reads.
 */
export type NotificationCategory =
  | 'community'
  | 'experience'
  | 'social'
  | 'guide'
  | 'booking'
  | 'uncategorized';

export type AppNotification = {
  id: string;
  recipient?: LinkedUser;
  content: string;
  pushCategory?: NotificationCategory;
  isRead: boolean;
  source?: string | null;
  dateCreated?: string;
};

/** An icon per kind, from the set the canvas draws notifications with. */
export const NOTIFICATION_ICON: Record<NotificationCategory, string> = {
  community: 'UserMultipleIcon',
  experience: 'Ticket01Icon',
  social: 'FavouriteIcon',
  guide: 'UserSharingIcon',
  booking: 'Invoice01Icon',
  uncategorized: 'Notification03Icon',
};

export const notificationIcon = (notification: AppNotification): string =>
  NOTIFICATION_ICON[notification.pushCategory ?? 'uncategorized'] ??
  NOTIFICATION_ICON.uncategorized;

/**
 * New first, then the rest - the canvas's two groups. Order within each is the
 * API's, which is newest first.
 */
export const splitByRead = (notifications: AppNotification[]) => ({
  unread: notifications.filter((one) => !one.isRead),
  read: notifications.filter((one) => one.isRead),
});

/** What the badge shows. Past 9 it stops counting, as badges do. */
export const unreadBadge = (count: number): string | null => {
  if (count <= 0) return null;

  return count > 9 ? '9+' : String(count);
};
