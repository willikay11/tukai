import { CANVAS_ICONS } from '@/utils/canvas-icons';

export type PlaceDrawerTab = {
  /** Doubles as the id of the section it scrolls to. */
  id: string;
  label: string;
  icon: string;
};

export const PLACE_SECTIONS = {
  about: 'place-about',
  reservations: 'place-reservations',
  experiences: 'place-experiences',
  moments: 'place-moments',
  reviews: 'place-reviews',
} as const;

/**
 * The drawer's tabs. They are anchors, not panels: every section is in the
 * drawer at once and the pills follow the reader down it.
 *
 * Experiences is only offered when the place has some - an empty tab would
 * scroll to a section with nothing in it. Reservations is the manager's own
 * view of the place's bookings, so it is offered only to them.
 */
export const placeDrawerTabs = (
  reviewCount: number | null,
  hasExperiences: boolean,
  hasReservations = false,
): PlaceDrawerTab[] => [
  { id: PLACE_SECTIONS.about, label: 'About', icon: 'InformationCircleIcon' },
  ...(hasReservations
    ? [{ id: PLACE_SECTIONS.reservations, label: 'Reservations', icon: 'CalendarCheckIn01Icon' }]
    : []),
  ...(hasExperiences
    ? [{ id: PLACE_SECTIONS.experiences, label: 'Experiences', icon: CANVAS_ICONS.calendar }]
    : []),
  { id: PLACE_SECTIONS.moments, label: 'Moments', icon: 'DashboardCircleIcon' },
  {
    id: PLACE_SECTIONS.reviews,
    label: reviewCount ? `Reviews (${reviewCount.toLocaleString('en-US')})` : 'Reviews',
    icon: CANVAS_ICONS.star,
  },
];

export const PLACE_SECTION_IDS = Object.values(PLACE_SECTIONS);
