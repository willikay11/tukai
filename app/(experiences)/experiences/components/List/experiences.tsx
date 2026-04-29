'use client';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import { useSession } from 'next-auth/react';

import clsx from 'clsx';

import { ListExperiences } from '@/app/shared/components/Experiences/List';
import { useSelectedCategory } from '@/context/SelectedCategoryContext';
import { useExperiences } from '@/app/shared/hooks/useExperiences';

type ListExperiencesProps = {
  title?: string;
  skeletonCount?: number;
  category?: string;
  date?: string;
  isPortal?: boolean;
  isReserved?: boolean;
  isBookedmarked?: boolean;
  isHosted?: boolean;
  noDataMessage?: string;
};

export const Experiences = ({
  title,
  category,
  skeletonCount = 4,
  date,
  isPortal = false,
  isReserved = false,
  isBookedmarked = false,
  isHosted = false,
  noDataMessage,
}: ListExperiencesProps) => {
  const { selectedCategoryId } = useSelectedCategory();
  const { data: session } = useSession();
  const [page, setPage] = useState(1);
  const [hasExperiences, setHasExperiences] = useState<boolean | null>(null);
  const { data: experiences, isLoading } = useExperiences(
    {
      page,
      date,
      reserved_by: isReserved ? session?.user?.id || undefined : undefined,
      hosted_by: isHosted ? session?.user?.id || undefined : undefined,
      bookmarked: isBookedmarked ? session?.user?.id || undefined : undefined,
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

  if (isPortal && selectedCategoryId !== 'all') {
    return null;
  }

  if (hasExperiences === null && isPortal) {
    return null;
  }

  if (!hasExperiences && isPortal) {
    return null;
  }

  const content = (
    <div
      className={clsx(
        'col-span-12 mb-4 mt-4 md:col-span-10 md:col-start-2 md:mx-0 lg:col-span-10 lg:col-start-2 xl:col-span-10 xl:col-start-2 3xl:col-span-8 3xl:col-start-3 4xl:col-span-6 4xl:col-start-4',
      )}
    >
      {title && <p className="mb-4 text-xl font-semibold text-gray-700">{title}</p>}
      <ListExperiences
        key={selectedCategoryId}
        experiences={experiences?.data?.results}
        isLoading={isLoading}
        count={experiences?.data?.count}
        className={clsx(
          'grid grid-cols-1 gap-x-4 gap-y-8 md:grid-cols-4 lg:grid-cols-4 2xl:grid-cols-6 3xl:grid-cols-6 4xl:grid-cols-6',
        )}
        page={page}
        setPage={setPage}
        skeletonCount={skeletonCount}
        type={'discover'}
        noDataMessage={noDataMessage}
      />
    </div>
  );

  if (!isPortal) {
    return content;
  }

  const selector = '.grid.h-full.grid-cols-12.gap-x-4.px-4.md\\:px-0';
  const target = document.querySelector(selector) as HTMLElement | null;

  // If the main layout container exists, render inline to preserve the declared order.
  if (target) {
    return content;
  }

  // Otherwise create a portal container and mount there
  const portalRoot = document.createElement('div');
  portalRoot.className = 'grid h-full grid-cols-12 gap-x-4 px-4 md:px-0';
  document.body.appendChild(portalRoot);

  return createPortal(content, portalRoot);
};
