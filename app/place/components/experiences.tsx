'use client';
import ListExperiences from '@/app/components/experiences/List';
import { useExperiences } from '@/hooks/experiences';
import { useState } from 'react';

type ListExperiencesProps = {
  categories: string[];
};

export default function TabExperiences({ categories }: ListExperiencesProps) {
  const [page, setPage] = useState(1);
  const { data: experiences, isLoading } = useExperiences({
    page,
    enabled: true,
    category: categories.join(','),
  });

  return (
    <ListExperiences
      experiences={experiences?.data?.results}
      isLoading={isLoading}
      count={experiences?.data?.count}
      className="grid grid-cols-1 gap-x-4 gap-y-8 grid-cols-1"
      page={page}
      setPage={setPage}
      skeletonCount={2}
    />
  );
}
