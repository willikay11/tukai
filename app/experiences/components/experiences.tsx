'use client';
import ListExperiences from '@/app/components/experiences/List';
import { useExperiences } from '@/hooks/experiences';
import { useState } from 'react';

type ListExperiencesProps = {
  type: 'discover' | 'invited';
  skeletonCount?: number;
  category?: string;
};

export default function Experiences({ type, category, skeletonCount = 12 }: ListExperiencesProps) {
  const [page, setPage] = useState(1);
  const { data: experiences, isLoading } = useExperiences({
    page,
    enabled: type === 'discover',
    category,
  });

  const { data: invitedExperiences } = useExperiences({
    page,
    enabled: type === 'invited',
    invited: true,
  });

  return (
    <ListExperiences
      experiences={type === 'discover' ? experiences?.data?.results : invitedExperiences?.data?.results}
      isLoading={isLoading}
      count={type === 'discover' ? experiences?.data?.count : invitedExperiences?.data?.count}
      className="grid grid-cols-1 gap-x-4 gap-y-8 md:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-6"
      page={page}
      setPage={setPage}
      skeletonCount={skeletonCount}
    />
  );
}
