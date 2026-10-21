import { PlaceDrawerTab } from '@/app/shared/components/Places/PlaceDrawer/tabs';

/**
 * Prefixed, the same reason the experience drawer's are: the drawer can be
 * open over a page that renders this same community's own section ids.
 */
export const COMMUNITY_SECTIONS = {
  about: 'community-about',
  experiences: 'community-experiences',
  members: 'community-members',
  moments: 'community-moments',
} as const;

export const communityDrawerTabs = (): PlaceDrawerTab[] => [
  { id: COMMUNITY_SECTIONS.about, label: 'About', icon: 'InformationCircleIcon' },
  { id: COMMUNITY_SECTIONS.experiences, label: 'Experiences', icon: 'Ticket02Icon' },
  { id: COMMUNITY_SECTIONS.members, label: 'Members', icon: 'UserGroupIcon' },
  { id: COMMUNITY_SECTIONS.moments, label: 'Moments', icon: 'Camera01Icon' },
];

export const COMMUNITY_SECTION_IDS = Object.values(COMMUNITY_SECTIONS);
