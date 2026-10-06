'use client';

import { Fragment, useEffect, useMemo, useRef, useState } from 'react';

import { useSearchParams } from 'next/navigation';

import { PageContainer } from '@/app/shared/components/Layout';
import { MomentDrawer, MomentsMasonry } from '@/app/shared/components/Moments';
import { useInfiniteMoments } from '@/app/shared/hooks/useMoments';
import { usePlaceCategories } from '@/app/shared/hooks/usePlaces';
import { Moment, momentPhotos } from '@/types/moment';
import { PlaceCategory } from '@/types/placeCategory';

import { MomentsBreakRail } from './components/MomentsBreakRail';
import { MomentsShowMore } from './components/MomentsShowMore';
import { FEED_MIX_DEFAULT, FeedMix, splitIntoRuns } from './feed-mix';

const MasonrySkeleton = () => (
  <div className="columns-2 gap-4 md:columns-3 lg:columns-5">
    {[220, 300, 180, 260, 200, 320].map((height, index) => (
      <div
        key={index}
        style={{ height }}
        className="mb-4 w-full animate-pulse break-inside-avoid rounded-2xl bg-gray-200"
      />
    ))}
  </div>
);

interface MomentsViewProps {
  feedMix?: FeedMix;
}

export const MomentsView = ({ feedMix = FEED_MIX_DEFAULT }: MomentsViewProps) => {
  const searchParams = useSearchParams();
  const deepLinkedId = searchParams.get('momentId');

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteMoments();
  const [openMoment, setOpenMoment] = useState<Moment | null>(null);
  const hasOpenedDeepLink = useRef(false);
  const { data: categoriesResponse } = usePlaceCategories({ pageSize: 100 }, true);

  // Each break rail takes the next interest category in the API's order
  const interestCategories = useMemo(
    () =>
      ((categoriesResponse?.data?.results ?? []) as PlaceCategory[]).filter(
        (category) => category.group === 'interests',
      ),
    [categoriesResponse],
  );

  // The masonry is photo-led. A moment with no media - or whose only media is a
  // video / still-processing upload with photo: null - has nothing to show, and
  // would crash next/image if it reached one.
  const moments: Moment[] = useMemo(
    () =>
      (data?.pages ?? [])
        .flatMap((page) => (page?.data?.results ?? []) as Moment[])
        .filter((item) => momentPhotos(item).length > 0),
    [data],
  );

  // A shared link opens its moment in the drawer once it has loaded
  useEffect(() => {
    if (hasOpenedDeepLink.current || !deepLinkedId) return;

    const deepLinked = moments.find((item) => item.id === deepLinkedId);
    if (!deepLinked) return;

    hasOpenedDeepLink.current = true;
    setOpenMoment(deepLinked);
  }, [moments, deepLinkedId]);

  return (
    <PageContainer className="py-6">
      <div className="mb-6">
        <h1 className="text-[22px] font-bold leading-tight tracking-[-0.3px] text-brand-ink">
          Moments
        </h1>
      </div>

      {isLoading ? (
        <MasonrySkeleton />
      ) : moments.length === 0 ? (
        <p className="mt-5 text-[14.5px] leading-normal text-foreground">
          No moments yet. Yours could be the first.
        </p>
      ) : (
        <>
          {splitIntoRuns(moments, feedMix).map((run, runIndex, runs) => {
            const isLast = runIndex === runs.length - 1;
            const startIndex = runs
              .slice(0, runIndex)
              .reduce((total, earlier) => total + earlier.length, 0);

            return (
              <Fragment key={runIndex}>
                <MomentsMasonry
                  moments={run}
                  startIndex={startIndex}
                  tile="card"
                  columnsClassName="columns-2 gap-4 md:columns-3 lg:columns-5"
                  selectedId={openMoment?.id ?? null}
                  onSelect={(id) => setOpenMoment(moments.find((item) => item.id === id) ?? null)}
                />
                {!isLast && interestCategories[runIndex] && (
                  <MomentsBreakRail category={interestCategories[runIndex]} />
                )}
              </Fragment>
            );
          })}

          {hasNextPage && (
            <div className="mt-8 flex justify-center">
              <MomentsShowMore isLoading={isFetchingNextPage} onClick={() => fetchNextPage()} />
            </div>
          )}
        </>
      )}

      <MomentDrawer moment={openMoment} onClose={() => setOpenMoment(null)} />
    </PageContainer>
  );
};
