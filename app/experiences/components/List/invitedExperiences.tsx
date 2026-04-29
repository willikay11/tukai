'use client';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import { useSession } from 'next-auth/react';

import clsx from 'clsx';

import { ListExperiences } from '@/app/components/experiences/List';
import { useExperiences } from '@/hooks/experiences';

type ListExperiencesProps = {
  skeletonCount?: number;
  category?: string;
  isPortal?: boolean;
};

export default function Experiences({
  category,
  skeletonCount = 12,
  isPortal = false,
}: ListExperiencesProps) {
  const [page, setPage] = useState(1);
  const [hasExperiences, setHasExperiences] = useState<boolean | null>(null);
  const { data: session } = useSession();
  const { data: experiences, isLoading } = useExperiences(
    {
      page,
      invited: true,
    },
    session?.user?.id ? true : false,
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

  // Only show when user is signed in
  if (!session?.user) {
    return null;
  }

  if (hasExperiences === null && isPortal) {
    return null;
  }

  if (!hasExperiences && isPortal) {
    return null;
  }

  const content = (
    <div className="col-span-12 bg-gray-100">
      <div className="grid h-full grid-cols-12 py-4">
        <div className={clsx('col-span-12 mx-4 mb-4 md:col-span-10 md:col-start-2 md:mx-0')}>
          <p className="mb-4 text-xl font-semibold text-gray-700">Invited Experiences</p>
          <ListExperiences
            experiences={experiences?.data?.results}
            isLoading={isLoading}
            count={experiences?.data?.count}
            className={clsx(
              'grid grid-cols-1 gap-x-4 gap-y-8 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4',
            )}
            page={page}
            setPage={setPage}
            skeletonCount={skeletonCount}
            type={'invited'}
          />
        </div>
      </div>
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
}
