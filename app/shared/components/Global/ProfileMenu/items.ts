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
  // Communities, Bucket lists and Plans left this menu for the primary nav,
  // where the canvas puts them. What stays is what the bar has no room for.
  { label: 'My Profile', icon: 'UserIcon', href: '/profile' },
  { label: 'Notifications', icon: 'Notification03Icon', href: '/inbox', showsUnreadDot: true },
  { label: 'Messages', icon: 'BubbleChatIcon', href: '/inbox' },
  { label: 'Control Center', icon: 'Analytics01Icon', href: '/control-center' },
];

export const UNAVAILABLE_TITLE = 'Coming soon';
