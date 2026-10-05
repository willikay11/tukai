/**
 * The four faces of Discover.
 *
 * The canvas holds these as tabs on one route and switches them in state. Here
 * they stay four addressable routes - the URLs predate the design and 25 links
 * point at them - so the strip is a row of links that reads as a tablist.
 *
 * Not to be confused with {@link DESTINATIONS}: those are where the app can
 * take you, and on a phone they are the bottom bar. These are what Discover
 * can show you.
 */
export interface DiscoverTab {
  label: string;
  href: string;
  icon: string;
}

export const DISCOVER_TABS: DiscoverTab[] = [
  { label: 'Discover', href: '/', icon: 'Search01Icon' },
  { label: 'Experiences', href: '/experiences', icon: 'Calendar03Icon' },
  { label: 'Places', href: '/places', icon: 'MapsLocation01Icon' },
  { label: 'Moments', href: '/moments', icon: 'DashboardCircleIcon' },
];

/** Discover is the root, so it matches only itself. */
export const isTabActive = (href: string, pathname: string): boolean =>
  href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);
