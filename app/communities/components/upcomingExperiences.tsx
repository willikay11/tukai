'use client';

import { useGetCommunities } from '@/hooks/communities';

export default function UpcomingExperiences({ category }: { category: string }) {
  const { data: upcomingExperiences } = useGetCommunities({
    page: 1,
    enabled: true,
    showUpComingExperiences: true,
    category,
  });

  console.log(upcomingExperiences);

  return <div>UpcomingExperiences</div>;
}
