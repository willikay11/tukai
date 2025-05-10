'use client';
import ListExperiences from '@/app/components/experiences/List';
import { useExperiences } from '@/hooks/experiences';
import clsx from 'clsx';
import { useState } from 'react';

type ListExperiencesProps = {
  type: 'discover' | 'invited';
  skeletonCount?: number;
  category?: string;
};

const ListExperiencesWrapper = ({
  type,
  children,
}: {
  type: 'discover' | 'invited';
  children: React.ReactNode;
}) => {
  if (type === 'invited') {
    return (
      <div className="col-span-12 bg-gray-100">
        <div className="grid h-full grid-cols-12 py-4">{children}</div>
      </div>
    );
  }

  return children;
};
export default function Experiences({ type, category, skeletonCount = 12 }: ListExperiencesProps) {
  const [page, setPage] = useState(1);
  const { data: experiences, isLoading } = useExperiences({
    page,
    enabled: type === 'discover',
    type: category,
    invited: false,
  });

  const { data: invitedExperiences } = useExperiences({
    page,
    enabled: type === 'invited',
    invited: true,
  });

  if (invitedExperiences?.data?.results?.length === 0 && type === 'invited') {
    return null;
  }

  return (
    <ListExperiencesWrapper type={type}>
      <div
        className={clsx('col-span-12 mx-4 mb-4 md:col-span-10 md:col-start-2 md:mx-0', {
          'mt-4': type === 'discover',
        })}
      >
        <p className="mb-4 text-xl font-semibold text-gray-700">
          {type === 'discover'
            ? `${category === 'all' || category === undefined ? 'Discover' : category.charAt(0).toUpperCase() + category.slice(1)} Experiences`
            : 'Invited Experiences'}
        </p>
        <ListExperiences
          experiences={
            type === 'discover' ? experiences?.data?.results : invitedExperiences?.data?.results
          }
          isLoading={isLoading}
          count={type === 'discover' ? experiences?.data?.count : invitedExperiences?.data?.count}
          className={clsx('grid grid-cols-1 gap-x-4 gap-y-8 md:grid-cols-2', {
            'lg:grid-cols-3 2xl:grid-cols-4': type === 'invited',
            'lg:grid-cols-4 2xl:grid-cols-6': type === 'discover',
          })}
          page={page}
          setPage={setPage}
          skeletonCount={skeletonCount}
          type={type}
        />
      </div>
    </ListExperiencesWrapper>
  );
}
