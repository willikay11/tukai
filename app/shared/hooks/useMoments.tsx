import { useQuery } from '@tanstack/react-query';

import { MomentsQueryParams, fetchMoments } from '@/services/moments';

export const useMoments = (params: MomentsQueryParams = {}, enabled: boolean = true) =>
  useQuery({
    queryKey: ['moments', params.page, params.page_size],
    queryFn: async () => await fetchMoments(params),
    enabled,
  });
