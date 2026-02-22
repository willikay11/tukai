import { useMutation, useQuery } from '@tanstack/react-query';

import { getInterestCategories, userExists } from '@/services/auth';

export const useUserExists = () => {
  return useMutation({
    mutationFn: async (email: string) => await userExists(email),
  });
};

export const useGetInterestCategories = () => {
  return useQuery({
    queryKey: ['interestCategories'],
    queryFn: async () => await getInterestCategories(1, 1000),
  });
};
