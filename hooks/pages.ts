import { useQuery } from '@tanstack/react-query';

import { getTermsOfService } from '@/services/pages';

export const useTermsOfService = () => {
  return useQuery({
    queryKey: ['terms-of-service'],
    queryFn: () => getTermsOfService(),
    staleTime: 3600 * 1000, // 1 hour, static content doesn't change often
  });
};
