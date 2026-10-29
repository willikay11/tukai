export interface ProfileMenuItem {
  label: string;
  icon: string;
  // Omitted where the destination does not exist yet; the item renders
  // disabled rather than linking somewhere that 404s
  href?: string;
  /** A lime numeric badge, e.g. unread notifications. No data yet renders no badge. */
  badgeCount?: number;
}

/**
 * The canvas's own two groups, each its own white card inside the menu's
 * tray: where your things are, then what is waiting for you. On a phone
 * these destinations are the bottom bar as well; on a desktop this menu is
 * the only way to them, which is why they live here and not in the tab strip.
 *
 * "TukAI" has no feature (window, floating trigger, anything) behind it
 * anywhere in the app yet, so it has no `href` and renders disabled, same as
 * any other row shown ahead of its own destination.
 */
export const PROFILE_MENU_GROUP_ONE: ProfileMenuItem[] = [
  { label: 'Profile', icon: 'UserCircleIcon', href: '/profile' },
  { label: 'Dashboard', icon: 'DashboardCircleAddIcon', href: '/dashboard' },
  { label: 'TukAI', icon: 'SparklesIcon' },
  { label: 'Communities', icon: 'UserMultipleIcon', href: '/communities' },
  { label: 'Bucket lists', icon: 'ShoppingBasketAdd02Icon', href: '/bucket-lists' },
];

/**
 * Messages have no page of their own; the inbox names the tab they land in, so
 * Messages points there too.
 */
export const PROFILE_MENU_GROUP_TWO: ProfileMenuItem[] = [
  { label: 'Notifications', icon: 'Notification02Icon', href: '/inbox' },
  { label: 'Messages', icon: 'Message01Icon', href: '/inbox' },
  { label: 'Help', icon: 'InformationCircleIcon', href: '/help' },
];

export const UNAVAILABLE_TITLE = 'Coming soon';
