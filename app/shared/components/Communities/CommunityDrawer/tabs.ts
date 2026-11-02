import { PlaceDrawerTab } from '@/app/shared/components/Places/PlaceDrawer/tabs';

/**
 * Prefixed, the same reason the experience drawer's are: the drawer can be
 * open over a page that renders this same community's own section ids.
 */
export const COMMUNITY_SECTIONS = {
  about: 'community-about',
  members: 'community-members',
  experiences: 'community-experiences',
  moments: 'community-moments',
} as const;

/**
 * The drawer's tabs, in the Communities handoff's order: About, Members,
 * Experiences, Moments. Experiences is only offered when the community has
 * something upcoming - an empty tab would scroll to a section with nothing in
 * it. (Places and Reviews are left out entirely - neither has a backend yet.)
 */
export const communityDrawerTabs = (hasExperiences: boolean): PlaceDrawerTab[] => [
  { id: COMMUNITY_SECTIONS.about, label: 'About', icon: 'InformationCircleIcon' },
  { id: COMMUNITY_SECTIONS.members, label: 'Members', icon: 'UserMultipleIcon' },
  ...(hasExperiences
    ? [{ id: COMMUNITY_SECTIONS.experiences, label: 'Experiences', icon: 'Calendar03Icon' }]
    : []),
  { id: COMMUNITY_SECTIONS.moments, label: 'Moments', icon: 'DashboardCircleIcon' },
];

export const COMMUNITY_SECTION_IDS = Object.values(COMMUNITY_SECTIONS);
