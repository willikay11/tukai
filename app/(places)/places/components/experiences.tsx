'use client';
import { useState } from 'react';

import { ListExperiences } from '@/app/shared/components/Experiences/List';
import { useExperiences } from '@/app/shared/hooks/useExperiences';

type ListExperiencesProps = {
  categories: string[];
};

export const TabExperiences = ({ categories }: ListExperiencesProps) => {
  const [page, setPage] = useState(1);
  const { data: experiences, isLoading } = useExperiences(
    {
      page,
      category: categories.map((category) => `category=${category}`).join(','),
    },
    true,
  );

  return (
    <ListExperiences
      experiences={experiences?.data?.results}
      isLoading={isLoading}
      count={experiences?.data?.count}
      className="grid grid-cols-1 gap-x-4 gap-y-8 px-4"
      page={page}
      setPage={setPage}
      skeletonCount={2}
      type="discover"
    />
  );
};
