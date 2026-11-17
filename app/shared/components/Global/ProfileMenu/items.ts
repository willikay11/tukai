import type { InboxTab } from '@/app/shared/components/Inbox';

export interface ProfileMenuItem {
  label: string;
  icon: string;
  // Omitted where the destination does not exist yet; the item renders
  // disabled rather than linking somewhere that 404s
  href?: string;
  /** A lime numeric badge, e.g. unread notifications. No data yet renders no badge. */
  badgeCount?: number;
  /**
   * Opens the inbox panel on this tab instead of following `href`. The href
   * stays as the fallback where there is no panel to open.
   */
  inboxTab?: InboxTab;
}

/**
 * The canvas's own two groups, each its own white card inside the menu's
 * tray: where your things are, then what is waiting for you. On a phone
 * some of these are the bottom bar as well; on a desktop this menu is the
 * only way to them, which is why they live here and not in the tab strip.
 */
export const PROFILE_MENU_GROUP_ONE: ProfileMenuItem[] = [
  { label: 'Profile', icon: 'UserCircleIcon', href: '/profile' },
  { label: 'Dashboard', icon: 'DashboardCircleAddIcon', href: '/dashboard' },
  { label: 'TukAI', icon: 'SparklesIcon', href: '/ai' },
  { label: 'Communities', icon: 'UserMultipleIcon', href: '/communities' },
  { label: 'Bucket lists', icon: 'ShoppingBasketAdd02Icon', href: '/bucket-lists' },
  // Not one of the bottom bar's four, so on a phone this is the way to it
  { label: 'Plans', icon: 'Calendar03Icon', href: '/plans' },
];

/**
 * Notifications and Messages each open the inbox panel on their own tab. The
 * menu draws Messages with `chatting-01` and the inbox tab with
 * `message-multiple-01`, as the handoff does (its open question 13).
 */
export const PROFILE_MENU_GROUP_TWO: ProfileMenuItem[] = [
  { label: 'Notifications', icon: 'Notification02Icon', href: '/inbox', inboxTab: 'notifications' },
  { label: 'Messages', icon: 'Chatting01Icon', href: '/inbox', inboxTab: 'messages' },
  { label: 'Help', icon: 'InformationCircleIcon', href: '/help' },
];

export const UNAVAILABLE_TITLE = 'Coming soon';
