import { CANVAS_ICONS } from '@/utils/canvas-icons';

export type PlaceDrawerTab = {
  /** Doubles as the id of the section it scrolls to. */
  id: string;
  label: string;
  icon: string;
};

export const PLACE_SECTIONS = {
  about: 'place-about',
  experiences: 'place-experiences',
  moments: 'place-moments',
  reviews: 'place-reviews',
} as const;

/**
 * The drawer's four tabs. They are anchors, not panels: every section is in
 * the drawer at once and the pills follow the reader down it.
 */
export const placeDrawerTabs = (reviewCount: number | null): PlaceDrawerTab[] => [
  { id: PLACE_SECTIONS.about, label: 'About', icon: 'InformationCircleIcon' },
  { id: PLACE_SECTIONS.experiences, label: 'Experiences', icon: CANVAS_ICONS.calendar },
  { id: PLACE_SECTIONS.moments, label: 'Moments', icon: 'DashboardCircleIcon' },
  {
    id: PLACE_SECTIONS.reviews,
    label: reviewCount ? `Reviews (${reviewCount})` : 'Reviews',
    icon: CANVAS_ICONS.star,
  },
];

export const PLACE_SECTION_IDS = Object.values(PLACE_SECTIONS);
