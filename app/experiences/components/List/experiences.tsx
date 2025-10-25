'use client';
import ListExperiences from '@/app/components/experiences/List';
import { useExperiences } from '@/hooks/experiences';
import clsx from 'clsx';
import { has } from 'lodash';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

type ListExperiencesProps = {
  title: string;
  skeletonCount?: number;
  category?: string;
  date?: string;
  isPortal?: boolean;
};

export default function Experiences({
  title,
  category,
  skeletonCount = 12,
  date,
  isPortal = false,
}: ListExperiencesProps) {
  const [page, setPage] = useState(1);
  const [hasExperiences, setHasExperiences] = useState<boolean | null>(null);
  const { data: experiences, isLoading } = useExperiences(
    {
      page,
      category: category,
      date,
    },
    true,
  );

  useEffect(() => {
    let mounted = true;

    const runCheck = async () => {
      if (experiences?.data?.results?.length) {
        setHasExperiences(true);
      } else {
        setHasExperiences(false);
      }
    };
    if (isPortal) {
      runCheck();
    }
    return () => {
      mounted = false;
    };
  }, [experiences, isPortal]);

  if (hasExperiences === null && isPortal) {
    return null;
  }

  if (!hasExperiences && isPortal) {
    return null;
  }

  const content = (
    <div className={clsx('col-span-12 mb-4 mt-4 md:col-span-10 md:col-start-2 md:mx-0')}>
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

  if (!isPortal) {
    return content;
  }

  const target = document.body;

  if (!target) {
    // fallback to rendering inline if portal target isn't present
    return content;
  }

  return createPortal(content, target);
}
