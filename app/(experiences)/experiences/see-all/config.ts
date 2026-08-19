import moment from 'moment';

import { ExperiencesQueryParams } from '@/services/experience';
import { formatLongDateWithOrdinal } from '@/utils/date-utils';

// One entry per "See all" section on /experiences. Adding a section to the
// listing page means adding it here — the see-all page is otherwise generic.
export const EXPERIENCE_SEE_ALL_TYPES = [
  'today',
  'tomorrow',
  'near-me',
  'city',
  'featured',
] as const;

export type ExperienceSeeAllType = (typeof EXPERIENCE_SEE_ALL_TYPES)[number];

// 'cities' is the odd one out: it lists destinations rather than experiences,
// and each card drills into ?type=city for that destination.
export const SEE_ALL_TYPES = [...EXPERIENCE_SEE_ALL_TYPES, 'cities'] as const;

export type SeeAllType = (typeof SEE_ALL_TYPES)[number];

// Page size for the grid. ListExperiences derives the last page from
// count / skeletonCount, so this must equal the page_size we request.
export const SEE_ALL_PAGE_SIZE = 12;

// Copy only — the API takes lat/long and decides the radius itself
export const NEAR_ME_RADIUS_KM = 25;

export const DEFAULT_CITY = 'Nairobi';

export interface SeeAllContext {
  // ?city= when present, otherwise the reverse-geocoded LocationContext city
  city: string;
  lat?: number;
  lng?: number;
}

interface SeeAllSection {
  title: (context: SeeAllContext) => string;
  // count is null until the first response lands
  subtitle: (context: SeeAllContext, count: number | null) => string;
  query: (context: SeeAllContext) => ExperiencesQueryParams;
}

export const isSeeAllType = (value: string | undefined): value is SeeAllType =>
  SEE_ALL_TYPES.includes(value as SeeAllType);

// A "See all" link only earns its place when the full-page grid would show
// meaningfully more than the row already does. Below this, the row is the
// whole story and the link is a dead end.
export const SEE_ALL_MIN_RESULTS = 10;

// Rows request a page_size smaller than this threshold, so the decision has to
// come from the API total — never from the length of the rendered array.
export const shouldShowSeeAll = (total: number | null | undefined): boolean =>
  (total ?? 0) >= SEE_ALL_MIN_RESULTS;

// Where a city card on the cities page points
export const cityExperiencesHref = (cityName: string) =>
  `/experiences/see-all?type=city&city=${encodeURIComponent(cityName)}`;

const resultsLabel = (count: number | null): string | null => {
  if (count === null) return null;
  return `${count} ${count === 1 ? 'result' : 'results'}`;
};

const joinSubtitle = (...parts: (string | null)[]): string => parts.filter(Boolean).join(' · ');

const today = () => moment().format('YYYY-MM-DD');
const tomorrow = () => moment().add(1, 'days').format('YYYY-MM-DD');

export const SEE_ALL_CONFIG: Record<ExperienceSeeAllType, SeeAllSection> = {
  today: {
    title: () => 'Happening Today',
    subtitle: (_context, count) =>
      joinSubtitle(formatLongDateWithOrdinal(new Date()), resultsLabel(count)),
    query: () => ({ date: today() }),
  },

  // ⚠️ The endpoint has no city filter, so the city here is context carried
  // from the listing row and is NOT applied to the query. Layering
  // `search: city` on top of `date` would drop any experience whose text
  // happens not to mention the city.
  tomorrow: {
    title: (context) => `Happening Tomorrow in ${context.city}`,
    subtitle: (_context, count) =>
      joinSubtitle(
        formatLongDateWithOrdinal(moment().add(1, 'days').toDate()),
        resultsLabel(count),
      ),
    query: () => ({ date: tomorrow() }),
  },

  'near-me': {
    title: () => 'Happening Near You',
    subtitle: (context, count) =>
      joinSubtitle(`Within ${NEAR_ME_RADIUS_KM} km of ${context.city}`, resultsLabel(count)),
    // ⚠️ No `near`/`radius` param exists — lat/long is the whole geo contract
    query: (context) => ({ status: 'published', lat: context.lat, long: context.lng }),
  },

  city: {
    title: (context) => `Experiences in ${context.city}`,
    subtitle: (_context, count) => joinSubtitle(resultsLabel(count)),
    // ⚠️ No `city` param — free-text search on the city name is the closest
    // available filter, matching what the listing row already does
    query: (context) => ({ search: context.city }),
  },

  featured: {
    title: () => 'Featured Experiences',
    subtitle: (_context, count) => joinSubtitle(resultsLabel(count)),
    // ⚠️ No `is_featured` param — the default published list stands in
    query: () => ({ status: 'published' }),
  },
};

// The cities grid is not paginated — every destination arrives in one page of
// place categories — so its count is simply how many cities we render.
export const CITIES_SECTION = {
  title: 'Experiences by City',
  subtitle: (count: number | null): string =>
    joinSubtitle(
      'Browse by destination',
      count === null ? null : `${count} ${count === 1 ? 'city' : 'cities'}`,
    ),
};
