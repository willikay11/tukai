import { useQuery } from '@tanstack/react-query';

import { fetchSubscriptionPlans } from '@/services/subscriptions';

export const useSubscriptionPlans = () => {
  return useQuery({
    queryKey: ['subscriptionPlans'],
    queryFn: async () => await fetchSubscriptionPlans(),
  });
};
