import { useMutation, useQuery } from '@tanstack/react-query';

import { getInterestCategories, getUsers, userExists } from '@/services/auth';

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

export const useGetUsers = (
  page = 1,
  pageSize = 10,
  email?: string,
  followers?: string,
  following?: string,
  blocked?: string,
) => {
  return useQuery({
    queryKey: ['users', page, pageSize, email, followers, following, blocked],
    queryFn: async () => await getUsers(page, pageSize, email, followers, following, blocked),
  });
};
