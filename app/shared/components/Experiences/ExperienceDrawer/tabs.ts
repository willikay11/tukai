import { PlaceDrawerTab } from '@/app/shared/components/Places/PlaceDrawer/tabs';

export const EXPERIENCE_SECTIONS = {
  about: 'experience-about',
  dayByDay: 'experience-day-by-day',
  tickets: 'experience-tickets',
  where: 'experience-where',
  host: 'experience-host',
  moments: 'experience-moments',
} as const;

/**
 * The drawer's tabs (ED-02). Anchors, not panels, same pattern as the place
 * drawer's: every section is already in the drawer at once and the pills
 * just track the reader down it - see `PlaceDrawerTabs`/`useScrollSpy`.
 *
 * Prices and Host are only offered when the experience actually has
 * something to show there - an empty tab would scroll to a section with
 * nothing in it. There is no "My tickets" tab: ED-05 keeps ticket holding
 * out of the drawer. Day by day is the same deal, gated on the experience
 * being an itinerary rather than waiting on its own days fetch.
 */
export const experienceDrawerTabs = (
  hasTickets: boolean,
  hasHost: boolean,
  isItinerary: boolean,
): PlaceDrawerTab[] => [
  { id: EXPERIENCE_SECTIONS.about, label: 'About', icon: 'InformationCircleIcon' },
  ...(isItinerary
    ? [{ id: EXPERIENCE_SECTIONS.dayByDay, label: 'Day by day', icon: 'Calendar03Icon' }]
    : []),
  ...(hasTickets
    ? [{ id: EXPERIENCE_SECTIONS.tickets, label: 'Prices', icon: 'Ticket01Icon' }]
    : []),
  { id: EXPERIENCE_SECTIONS.where, label: 'Location', icon: 'Location01Icon' },
  ...(hasHost ? [{ id: EXPERIENCE_SECTIONS.host, label: 'Host', icon: 'UserGroupIcon' }] : []),
  { id: EXPERIENCE_SECTIONS.moments, label: 'Moments', icon: 'DashboardCircleIcon' },
];

export const EXPERIENCE_SECTION_IDS = Object.values(EXPERIENCE_SECTIONS);
