'use client';

import { useGetCommunities } from '@/hooks/communities';

export default function RecommendedCommunities() {
  const {
    data: communities,
    isLoading,
    error,
  } = useGetCommunities({ page: 1, enabled: true, recommendedCommunities: true });

  return <div>Recommended Communities</div>;
}
