import { useSuspenseQuery } from '@tanstack/react-query';
import { fetchPlaceCategories } from '@/services/place';

export const usePlaceCategories = () => {
  return useSuspenseQuery({
    queryKey: ['placeCategories'],
    queryFn: async () => await fetchPlaceCategories(),
  });
};
