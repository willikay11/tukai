import { useQuery } from '@tanstack/react-query';
import { fetchPlaces, fetchPlaceCategories, fetchPlaceReviews } from '@/services/place';

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

export const usePlaceCategories = () => {
  return useQuery({
    queryKey: ['placeCategories'],
    queryFn: async () => await fetchPlaceCategories(),
  });
};

export const usePlaceReviews = (id: string) => {
  return useQuery({
    queryKey: ['placeReviews', id],
    queryFn: async () => await fetchPlaceReviews(id),
  });
};
