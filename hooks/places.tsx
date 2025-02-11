import { useQuery } from '@tanstack/react-query';
import { fetchPlaces } from '@/services/place';

export const usePlaces = ({ categoryId, enabled }: { categoryId?: string; enabled: boolean }) => {
  return useQuery({
    queryKey: ['placeCategories', categoryId],
    queryFn: async () => await fetchPlaces(categoryId),
    enabled,
  });
};
