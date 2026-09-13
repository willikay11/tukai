import { Community } from '@/types/community';
import { Experience } from '@/types/experience';
import { Place } from '@/types/place';
import { SearchResults } from '@/types/search';
import { parseSnakeToCamel } from '@/utils/parseSnakeToCamel';

import { getCommunities } from './community';
import { fetchExperiences } from './experience';
import { fetchPlaces } from './place';

// The list endpoints paginate, so `count` is the number of matches and
// `results` is only the page we asked for. Falling back to the page length
// keeps a malformed response from reading as "no matches".
const totalOf = (response: { data?: { count?: number; results?: unknown[] } }): number =>
  typeof response.data?.count === 'number'
    ? response.data.count
    : (response.data?.results?.length ?? 0);

const rowsOf = <T>(response: { data?: { results?: unknown[] } }): T[] =>
  (parseSnakeToCamel(response.data?.results) as T[]) ?? [];

/**
 * No unified search endpoint exists — this fans out to the three per-type list
 * endpoints with their `search` param and returns the groups side by side.
 *
 * `perPage` caps the rows returned per type; the counts are the API's totals,
 * so "Experiences · 24" stays honest while the popover shows only the first
 * few.
 */
export const searchPlaces = async (
  query?: string,
  categoryId?: string,
  perPage?: number,
): Promise<SearchResults> => {
  const [places, experiences, communities] = await Promise.all([
    fetchPlaces(1, perPage ?? 5, categoryId, query),
    // ⚠️ Do NOT pass `invited` here. The API treats the parameter's PRESENCE as
    // a filter, so `invited=false` matches nothing and the experiences group
    // comes back empty for every query.
    fetchExperiences({
      page: 1,
      page_size: perPage ?? 5,
      category: categoryId,
      search: query,
    }),
    getCommunities(undefined, 1, perPage ?? 5, query),
  ]);

  const counts = {
    experience: totalOf(experiences),
    place: totalOf(places),
    community: totalOf(communities),
    total: 0,
  };
  counts.total = counts.experience + counts.place + counts.community;

  return {
    experiences: rowsOf<Experience>(experiences),
    places: rowsOf<Place>(places),
    communities: rowsOf<Community>(communities),
    counts,
  };
};
