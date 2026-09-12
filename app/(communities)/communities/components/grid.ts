/**
 * The shape a list of communities takes on this page.
 *
 * Shared so Discover and Following cannot drift apart: they show the same
 * cards, and a reader switching tabs should not have the page re-flow under
 * them.
 */
export const COMMUNITY_GRID = 'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';

/** Cards shown before "Show More" is pressed — one full row at the widest. */
export const COMMUNITY_GRID_COLLAPSED = 4;
