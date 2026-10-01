import { Community } from './community';
import { Experience } from './experience';
import { Place } from './place';

export type SearchResultType = 'experience' | 'place' | 'community';

export type SearchResult = {
  id: string;
  type: SearchResultType;
  data: Place | Experience | Community;
};

/**
 * Search results kept grouped by type. The popover shows a count per type and
 * can filter to one group, so the shape mirrors that rather than flattening
 * into one list and re-partitioning at render time.
 */
export type SearchResults = {
  experiences: Experience[];
  places: Place[];
  communities: Community[];
  // Totals from the API, not the page length — the popover requests only a few
  // rows per type, so `experiences.length` would understate a broad query
  counts: {
    experience: number;
    place: number;
    community: number;
    total: number;
  };
};

/**
 * What a reader can narrow a search by.
 *
 * ⚠️ The canvas offers more — time of day, duration, a distance radius, price,
 * open now, drop-in, reservable, offers, step-free access, parking, a minimum
 * rating. None are filterable: `/experiences/` takes 19 query parameters and
 * `/places/` 11, and this is what the two have between them.
 */
export type ResultType = 'all' | 'experiences' | 'places' | 'communities';

export type SearchFilters = {
  query: string;
  type: ResultType;
  /** A category id, which both experiences and places accept. */
  category?: string;
  /** `YYYY-MM-DD`, experiences only. */
  date?: string;
  freeOnly: boolean;
  availableOnly: boolean;
  /**
   * The shapes a reader picked, one or more. Only `itinerary` is a value the
   * API filters on; the rest describe how an experience sits in the calendar,
   * which no endpoint exposes — see `matchesShapes`.
   */
  experienceShapes: string[];
  /** Places ranked by rating rather than relevance. */
  popularFirst: boolean;
};

export const EMPTY_FILTERS: SearchFilters = {
  query: '',
  type: 'all',
  experienceShapes: [],
  freeOnly: false,
  availableOnly: false,
  popularFirst: false,
};
