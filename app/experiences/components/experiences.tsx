'use client';
import ListExperiences from '@/app/components/experiences/List';
import { useExperiences } from '@/hooks/experiences';
import { useState } from 'react';

type ListExperiencesProps = {
  category?: string;
};

export default function Experiences({ category }: ListExperiencesProps) {
  const [page, setPage] = useState(1);
  const { data: experiences, isLoading } = useExperiences({
    page,
    enabled: true,
    category,
  });

  return (
    <ListExperiences
      experiences={experiences?.data?.results}
      isLoading={isLoading}
      count={experiences?.data?.count}
      className="grid grid-cols-1 gap-x-4 gap-y-8 md:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-6"
      page={page}
      setPage={setPage}
    />
  );
}
