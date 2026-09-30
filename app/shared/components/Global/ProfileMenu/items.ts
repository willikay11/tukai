export interface ProfileMenuItem {
  label: string;
  icon: string;
  // Omitted where the destination does not exist yet; the item renders
  // disabled rather than linking somewhere that 404s
  href?: string;
  showsUnreadDot?: boolean;
}

/**
 * ⚠️ Messages have no page of their own yet; the inbox names the tab they will
 * land in, so Messages points there too. Everything with an href routes.
 */
export const PROFILE_MENU_ITEMS: ProfileMenuItem[] = [
  { label: 'My Profile', icon: 'UserIcon', href: '/auth/profile' },
  {
    label: 'My Communities',
    icon: 'UserMultipleIcon',
    href: '/communities?category=my-communities',
  },
  { label: 'Bucket List', icon: 'ShoppingBasket01Icon', href: '/bucket-lists' },
  { label: 'My Plans', icon: 'MapsIcon', href: '/plans' },
  { label: 'Notifications', icon: 'Notification03Icon', href: '/inbox', showsUnreadDot: true },
  { label: 'Messages', icon: 'BubbleChatIcon', href: '/inbox' },
  { label: 'Control Center', icon: 'Analytics01Icon', href: '/control-center' },
];

export const UNAVAILABLE_TITLE = 'Coming soon';
