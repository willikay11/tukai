'use client';
import ListExperiences from '@/app/components/experiences/List';
import { useExperiences } from '@/hooks/experiences';
import clsx from 'clsx';
import { useState } from 'react';

type ListExperiencesProps = {
  title: string;
  skeletonCount?: number;
  category?: string;
  date?: string;
};

export default function Experiences({ title, category, skeletonCount = 12, date }: ListExperiencesProps) {
  const [page, setPage] = useState(1);
  const { data: experiences, isLoading } = useExperiences(
    {
      page,
      category: category,
      date
    },
    true,
  );
  return (
    <div className={clsx('col-span-12 mx-4 mb-4 mt-4 md:col-span-10 md:col-start-2 md:mx-0')}>
      <p className="mb-4 text-xl font-semibold text-gray-700">{title}</p>
      <ListExperiences
        experiences={experiences?.data?.results}
        isLoading={isLoading}
        count={experiences?.data?.count}
        className={clsx(
          'grid grid-cols-1 gap-x-4 gap-y-8 md:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-6',
        )}
        page={page}
        setPage={setPage}
        skeletonCount={skeletonCount}
        type={'discover'}
      />
    </div>
  );
}
