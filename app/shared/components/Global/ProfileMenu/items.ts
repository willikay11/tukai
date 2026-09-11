export interface ProfileMenuItem {
  label: string;
  icon: string;
  // Omitted where the destination does not exist yet; the item renders
  // disabled rather than linking somewhere that 404s
  href?: string;
  showsUnreadDot?: boolean;
}

/**
 * ⚠️ Notifications and Messages have no page yet, so they are listed but
 * disabled until those land. Everything with an href routes.
 */
export const PROFILE_MENU_ITEMS: ProfileMenuItem[] = [
  { label: 'My Profile', icon: 'UserIcon', href: '/auth/profile' },
  {
    label: 'My Communities',
    icon: 'UserMultipleIcon',
    href: '/communities?category=my-communities',
  },
  { label: 'Bucket List', icon: 'ShoppingBasket01Icon', href: '/bucket-lists' },
  { label: 'Notifications', icon: 'Notification03Icon', showsUnreadDot: true },
  { label: 'Messages', icon: 'BubbleChatIcon' },
  { label: 'Control Center', icon: 'Analytics01Icon', href: '/control-center' },
];

export const UNAVAILABLE_TITLE = 'Coming soon';
