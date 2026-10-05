export interface ProfileMenuItem {
  label: string;
  icon: string;
  // Omitted where the destination does not exist yet; the item renders
  // disabled rather than linking somewhere that 404s
  href?: string;
  showsUnreadDot?: boolean;
}

/**
 * Messages have no page of their own; the inbox names the tab they land in, so
 * Messages points there too. Everything with an href routes.
 */
export const PROFILE_MENU_ITEMS: ProfileMenuItem[] = [
  // The canvas's own grouping: where your things are, then what is waiting for
  // you. On a phone these destinations are the bottom bar as well; on a desktop
  // this menu is the only way to them, which is why they live here and not in
  // the tab strip.
  { label: 'My communities', icon: 'UserMultipleIcon', href: '/communities' },
  { label: 'Bucket lists', icon: 'ShoppingBasketAdd02Icon', href: '/bucket-lists' },
  { label: 'Plans', icon: 'Calendar03Icon', href: '/plans' },
  { label: 'Notifications', icon: 'Notification02Icon', href: '/inbox', showsUnreadDot: true },
  { label: 'Messages', icon: 'Message01Icon', href: '/inbox' },
  { label: 'Control centre', icon: 'DashboardSquare01Icon', href: '/control-center' },
  { label: 'Help', icon: 'InformationCircleIcon', href: '/help' },
];

/** Where the canvas puts a rule: after the three that are yours. */
export const PROFILE_MENU_DIVIDER_AFTER = 3;

export const UNAVAILABLE_TITLE = 'Coming soon';
