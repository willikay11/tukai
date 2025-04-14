import { useQuery } from '@tanstack/react-query';
import { searchPlaces } from '@/services/search';

export const useSearch = (query: string, categoryId?: string) => {
  return useQuery({
    queryKey: ['search', query, categoryId],
    queryFn: () => searchPlaces(query, categoryId, 5),
    enabled: !!query,
  });
};
