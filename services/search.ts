import { SearchResult, SearchResultType } from '@/types/search';
import { parseSnakeToCamel } from '@/utils/parseSnakeToCamel';

import { getCommunities } from './community';
import { fetchExperiences } from './experience';
import { fetchPlaces } from './place';

// No unified search endpoint exists — fan out to the three per-type list
// endpoints with their `search` param and merge, tagging each result by source
export const searchPlaces = async (
  query?: string,
  categoryId?: string,
  perPage?: number,
): Promise<SearchResult[]> => {
  const [places, experiences, communities] = await Promise.all([
    fetchPlaces(1, perPage ?? 5, categoryId, query),
    fetchExperiences({
      page: 1,
      page_size: perPage ?? 5,
      category: categoryId,
      invited: false,
      search: query,
    }),
    getCommunities(undefined, 1, perPage ?? 5, query),
  ]);

  const tagResults = (items: { id: string }[] | undefined, type: SearchResultType) =>
    (items ?? []).map(
      (data): SearchResult => ({
        id: `${type}-${data.id}`,
        type,
        data: data as SearchResult['data'],
      }),
    );

  return [
    ...tagResults(parseSnakeToCamel(experiences.data?.results), 'experience'),
    ...tagResults(parseSnakeToCamel(places.data?.results), 'place'),
    ...tagResults(parseSnakeToCamel(communities.data?.results), 'community'),
  ];
};
