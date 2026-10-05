/**
 * The app's primary destinations.
 *
 * The canvas carries five, and they are not the four this app shipped with:
 * Experiences, Places and Moments are tabs on Discover there, while Bucket
 * lists, Plans and You are destinations of their own. Those three were buried
 * in the avatar menu here.
 *
 * The three demoted routes keep their URLs - they stay addressable, every link
 * to them keeps working, and Discover's tab strip selects between them. Only
 * their place in the bar changed.
 */
export interface Destination {
  label: string;
  href: string;
  /** From the canvas's own icon names, through `utils/canvas-icons`. */
  icon: string;
  /**
   * The reader's own face stands in for the icon where there is one, which is
   * what the canvas does for "You".
   */
  showsFace?: boolean;
}

export const DESTINATIONS: Destination[] = [
  { label: 'Discover', href: '/', icon: 'CompassIcon' },
  { label: 'Bucket lists', href: '/bucket-lists', icon: 'ShoppingBasketAdd02Icon' },
  { label: 'Communities', href: '/communities', icon: 'UserMultipleIcon' },
  { label: 'Plans', href: '/plans', icon: 'Calendar03Icon' },
  { label: 'You', href: '/profile', icon: 'UserIcon', showsFace: true },
];

/**
 * Whether a destination is the one being looked at.
 *
 * Discover is the root, so it matches only itself - every other path starts
 * with `/` and would otherwise light it up permanently.
 */
export const isDestinationActive = (href: string, pathname: string): boolean =>
  href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);
