import { useQuery } from '@tanstack/react-query';
import { searchPlaces } from '@/services/search';

export const useSearch = (query: string) => {
  return useQuery({
    queryKey: ['search', query],
    queryFn: () => searchPlaces(query),
    enabled: !!query,
  });
};
