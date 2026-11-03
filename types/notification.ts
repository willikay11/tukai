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

/**
 * What the lime badge shows. The handoff leaves the cap open (its question 12)
 * and suggests 99+, which is what this does.
 */
export const unreadBadge = (count: number): string | null => {
  if (count <= 0) return null;

  return count > 99 ? '99+' : String(count);
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * When, always absolute, as the inbox writes it: "Nov 3, 9:20 AM". 12-hour
 * clock, no leading zero on the hour, in the reader's own time zone.
 */
export const inboxStamp = (iso?: string | null): string | null => {
  if (!iso) return null;

  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;

  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${MONTHS[date.getMonth()]} ${date.getDate()}, ${hours % 12 || 12}:${minutes} ${hours >= 12 ? 'PM' : 'AM'}`;
};

/**
 * Where opening a notification goes.
 *
 * The API has no structured target yet - only `source`, a free string. It is
 * followed only when it is a path inside the app; anything else leaves the
 * row as one that just marks itself read, as the design does for a
 * notification with no destination.
 */
export const notificationHref = (notification: AppNotification): string | null => {
  const source = notification.source?.trim();

  return source && source.startsWith('/') && !source.startsWith('//') ? source : null;
};

/** The list out of either shape the API answers with, paginated or bare. */
export const notificationList = (
  payload?: AppNotification[] | { results?: AppNotification[] } | null,
): AppNotification[] => (Array.isArray(payload) ? payload : (payload?.results ?? []));

/**
 * The same answer with some notifications read, keeping its shape - for
 * updating the cache before the server confirms.
 */
export const withRead = <T extends AppNotification[] | { results?: AppNotification[] }>(
  payload: T,
  isTarget: (notification: AppNotification) => boolean,
): T => {
  const mark = (list: AppNotification[]) =>
    list.map((one) => (isTarget(one) ? { ...one, isRead: true } : one));

  if (Array.isArray(payload)) return mark(payload) as T;

  return { ...payload, results: mark(payload.results ?? []) };
};

/**
 * What a reader gets notified about, and on which channel.
 *
 * Not one switch per content category with a shared channel list underneath -
 * on the wire, email and push are each their own set of categories, and they
 * don't match: email has no "social" toggle, push has no "marketing" one, and
 * there is no WhatsApp channel at all.
 */
export type NotificationPreferences = {
  id: string;
  email: string;
  marketing: boolean;
  communities: boolean;
  experiences: boolean;
  pushCommunity: boolean;
  pushExperiences: boolean;
  pushSocial: boolean;
  pushGuides: boolean;
};
