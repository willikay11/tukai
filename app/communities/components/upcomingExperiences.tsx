'use client';

import { useInterestBasedCommunities } from '@/hooks/communities';

export default function UpcomingExperiences({ category }: { category: string }) {
  const { data: upcomingExperiences } = useInterestBasedCommunities({
    page: 1,
    enabled: true,
    showUpComingExperiences: true,
    category,
  });

  console.log(upcomingExperiences);

  return <div>UpcomingExperiences</div>;
}
