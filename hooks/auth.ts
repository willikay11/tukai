import { useMutation } from '@tanstack/react-query';

import { userExists } from '@/services/auth';

export const useUserExists = () => {
  return useMutation({
    mutationFn: async (email: string) => await userExists(email),
  });
};
