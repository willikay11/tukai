import { useQuery } from '@tanstack/react-query';

import { getHelp, getPrivacyPolicy, getTermsOfService } from '@/services/pages';

export const useTermsOfService = () => {
  return useQuery({
    queryKey: ['terms-of-service'],
    queryFn: () => getTermsOfService(),
    staleTime: 3600 * 1000, // 1 hour, static content doesn't change often
  });
};

export const usePrivacyPolicy = () => {
  return useQuery({
    queryKey: ['privacy-policy'],
    queryFn: () => getPrivacyPolicy(),
    staleTime: 3600 * 1000, // 1 hour, static content doesn't change often
  });
};

export const useHelp = () => {
  return useQuery({
    queryKey: ['help'],
    queryFn: () => getHelp(),
    staleTime: 3600 * 1000, // 1 hour, static content doesn't change often
  });
};
