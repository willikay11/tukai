import { useQuery } from '@tanstack/react-query';

import { searchAll, searchPlaces } from '@/services/search';
import { SearchFilters } from '@/types/search';

export const useSearch = (query?: string, categoryId?: string) => {
  return useQuery({
    queryKey: ['search', query, categoryId],
    queryFn: () => searchPlaces(query, categoryId, 5),
    enabled: !!query,
  });
};

/**
 * The results view's own query. Held apart from {@link useSearch} because the
 * popover wants a handful of rows for a bare query and this wants a page of
 * them for a query and its filters.
 */
export const useSearchResults = (filters: SearchFilters, enabled = true) =>
  useQuery({
    queryKey: ['search-results', filters],
    queryFn: () => searchAll(filters),
    enabled,
  });
