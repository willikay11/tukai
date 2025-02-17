import { useQuery } from '@tanstack/react-query';
import { fetchPlaceCategories } from '@/services/place';

export const usePlaceCategories = () => {
  return useQuery({
    queryKey: ['placeCategories'],
    queryFn: async () => await fetchPlaceCategories(),
  });
};
