import type { AuthReason } from '@/app/shared/components/Auth/AuthDialog/authReasons';

import { DISCOVER_TABS } from './tabs';

/**
 * The app's primary destinations: on a phone, the bottom tab bar.
 *
 * Four, per the mobile handoff: Discover, Bucket lists, Communities and You.
 * Experiences, Places and Moments are tabs on Discover rather than
 * destinations, and Plans lives in the account menu. Every one of those keeps
 * its URL, so links to them still resolve.
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
  /** Other sections this destination is current on, beyond its own href. */
  alsoCurrentOn?: string[];
  /** Set where a signed-out reader is asked to sign in instead of going. */
  needsAccount?: AuthReason;
}

export const DESTINATIONS: Destination[] = [
  {
    label: 'Discover',
    href: '/',
    icon: 'CompassIcon',
    // Discover's other three faces are routes of their own here, not tabs in
    // state, and Discover stays current on each
    alsoCurrentOn: DISCOVER_TABS.map((tab) => tab.href).filter((href) => href !== '/'),
  },
  {
    label: 'Bucket lists',
    href: '/bucket-lists',
    icon: 'ShoppingBasketAdd02Icon',
    needsAccount: 'lists',
  },
  { label: 'Communities', href: '/communities', icon: 'UserMultipleIcon' },
  {
    label: 'You',
    href: '/profile',
    icon: 'UserIcon',
    showsFace: true,
    alsoCurrentOn: ['/help', '/dashboard'],
    needsAccount: 'profile',
  },
];

/**
 * Whether `pathname` is `href` or beneath it.
 *
 * The root matches only itself - every other path starts with `/` and would
 * otherwise light it up permanently.
 */
const isWithin = (href: string, pathname: string): boolean =>
  href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);

/** Whether a destination is the one being looked at. */
export const isDestinationActive = (destination: Destination, pathname: string): boolean =>
  [destination.href, ...(destination.alsoCurrentOn ?? [])].some((href) => isWithin(href, pathname));
