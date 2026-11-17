import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

import {
  fetchMyProfile,
  getInterestCategories,
  getUsers,
  updateMyProfile,
  userExists,
} from '@/services/auth';

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

/** The signed-in reader's own profile. */
export const useMyProfile = (userId?: string | null) =>
  useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => await fetchMyProfile(userId as string),
    enabled: Boolean(userId),
  });

/**
 * The reader's own photo, as the profile page shows it.
 *
 * The session's `image` is fixed at sign-in, and for Google and Apple it is
 * the provider's photo rather than the one set on Tukai - so it is only the
 * fallback until the profile has loaded. Shares the profile page's query, so
 * an edit there refreshes this too.
 */
export const useMyPicture = (): string | null => {
  const { data: session } = useSession();
  const { data: response } = useMyProfile(session?.user?.id);
  const profilePicture: string | null | undefined = response?.success ? response.data?.picture : undefined;

  return profilePicture || session?.user?.image || null;
};

export const useUpdateMyProfile =(userId?: string | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (changes: Parameters<typeof updateMyProfile>[1]) =>
      await updateMyProfile(userId as string, changes),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profile', userId] }),
  });
};
