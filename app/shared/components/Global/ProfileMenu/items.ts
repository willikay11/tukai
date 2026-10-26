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
 * "Profile" has no row of its own here - the menu's personalised header
 * card (avatar, name, handle) already links to /profile, so a plain row
 * would just repeat it.
 *
 * "Dashboard" is this app's /control-center, the only dashboard-like route
 * that exists - the canvas's name for the same destination. "Plans" has no
 * counterpart in the canvas at all; it is a real, shipped feature (a
 * device-local trip planner, also linked from the bottom nav) kept here as
 * a deliberate deviation rather than dropped for the sake of matching the
 * canvas exactly. The canvas's "TukAI" row is left out entirely - no such
 * feature (window, floating trigger, anything) exists anywhere in the app
 * yet, so there is nowhere for it to go.
 */
export const PROFILE_MENU_GROUP_ONE: ProfileMenuItem[] = [
  { label: 'Dashboard', icon: 'DashboardCircleAddIcon', href: '/control-center' },
  { label: 'Communities', icon: 'UserMultipleIcon', href: '/communities' },
  { label: 'Plans', icon: 'Calendar03Icon', href: '/plans' },
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
