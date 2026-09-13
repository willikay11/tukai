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
