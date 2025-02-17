import { useQuery } from '@tanstack/react-query';
import { fetchPlaces } from '@/services/place';

export const usePlaces = ({
  categoryId,
  page,
  enabled,
}: {
  categoryId?: string;
  page: number;
  enabled: boolean;
}) => {
  return useQuery({
    queryKey: ['placeCategories', categoryId, page],
    queryFn: async () => await fetchPlaces(categoryId, page),
    enabled,
  });
};
