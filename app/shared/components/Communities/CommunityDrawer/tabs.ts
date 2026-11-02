/**
 * Prefixed, the same reason the experience drawer's are: the drawer can be
 * open over a page that renders this same community's own section ids.
 */
export const COMMUNITY_SECTIONS = {
  about: 'community-about',
  members: 'community-members',
  experiences: 'community-experiences',
  places: 'community-places',
  moments: 'community-moments',
  reviews: 'community-reviews',
} as const;

export type CommunityDrawerTab = { id: string; label: string; icon: string };

/**
 * The handoff's tabs, in its order: About, Members, Experiences, Places,
 * Moments, Reviews. Experiences and Places only show when there is something
 * in them - an empty tab would scroll to a section that is not there.
 *
 * ⚠️ Places comes before Moments here, as the handoff lists them, though the
 * body puts Moments first (its Open item 8). The scroll spy follows the body.
 */
export const communityDrawerTabs = ({
  hasExperiences,
  hasPlaces,
  reviewCount,
}: {
  hasExperiences: boolean;
  hasPlaces: boolean;
  reviewCount: number;
}): CommunityDrawerTab[] => [
  { id: COMMUNITY_SECTIONS.about, label: 'About', icon: 'InformationCircleIcon' },
  { id: COMMUNITY_SECTIONS.members, label: 'Members', icon: 'UserMultipleIcon' },
  ...(hasExperiences
    ? [{ id: COMMUNITY_SECTIONS.experiences, label: 'Experiences', icon: 'Calendar03Icon' }]
    : []),
  ...(hasPlaces
    ? [{ id: COMMUNITY_SECTIONS.places, label: 'Places', icon: 'Location01Icon' }]
    : []),
  { id: COMMUNITY_SECTIONS.moments, label: 'Moments', icon: 'DashboardCircleIcon' },
  { id: COMMUNITY_SECTIONS.reviews, label: `Reviews (${reviewCount})`, icon: 'StarIcon' },
];

/** The body's own order, which the scroll spy has to follow. */
export const SECTION_ORDER: string[] = [
  COMMUNITY_SECTIONS.about,
  COMMUNITY_SECTIONS.members,
  COMMUNITY_SECTIONS.experiences,
  COMMUNITY_SECTIONS.moments,
  COMMUNITY_SECTIONS.places,
  COMMUNITY_SECTIONS.reviews,
];

/**
 * Where a section stops when its tab is tapped: 78px under the body's top,
 * and the body starts under the 68px header.
 */
export const SECTION_SCROLL_MARGIN = 'scroll-mt-[146px]';

/** A section is current once its top is within 84px of the body's top. */
export const SPY_OFFSET = 68 + 84;
