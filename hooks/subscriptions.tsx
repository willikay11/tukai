import { fetchSubscriptionPlans } from '@/services/subscriptions';
import { useQuery } from '@tanstack/react-query';

export const useSubscriptionPlans = () => {
  return useQuery({
    queryKey: ['subscriptionPlans'],
    queryFn: async () => await fetchSubscriptionPlans(),
  });
};
