'use client';

import { Fragment, useEffect, useMemo, useState } from 'react';

import { useSearchParams } from 'next/navigation';

import { PageContainer } from '@/app/shared/components/Layout';
import { MomentsMasonry } from '@/app/shared/components/Moments';
import { useInfiniteMoments } from '@/app/shared/hooks/useMoments';
import { usePlaceCategories } from '@/app/shared/hooks/usePlaces';
import { Drawer } from '@/components/ui/drawer';
import { Moment, momentPhotos } from '@/types/moment';
import { PlaceCategory } from '@/types/placeCategory';

import { MomentDetail } from './components/MomentDetail';
import { MomentsBreakRail } from './components/MomentsBreakRail';
import { FEED_MIX_DEFAULT, FeedMix, splitIntoRuns } from './feed-mix';

const MasonrySkeleton = () => (
  <div className="columns-2 gap-4 md:columns-3">
    {[220, 300, 180, 260, 200, 320].map((height, index) => (
      <div
        key={index}
        style={{ height }}
        className="mb-4 w-full animate-pulse break-inside-avoid rounded-2xl bg-gray-200"
      />
    ))}
  </div>
);

// The detail pane is only rendered from lg up; below that a tap opens a sheet
const useIsDesktop = () => {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(min-width: 1024px)');
    const update = () => setIsDesktop(media.matches);

    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  return isDesktop;
};

interface MomentsViewProps {
  feedMix?: FeedMix;
}

export const MomentsView = ({ feedMix = FEED_MIX_DEFAULT }: MomentsViewProps) => {
  const searchParams = useSearchParams();
  const deepLinkedId = searchParams.get('momentId');

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteMoments();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const isDesktop = useIsDesktop();
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

  // Preselect the deep-linked moment when it arrives, otherwise the first one
  useEffect(() => {
    if (selectedId || moments.length === 0) return;

    const deepLinked = deepLinkedId && moments.find((item) => item.id === deepLinkedId);
    setSelectedId(deepLinked ? deepLinked.id : moments[0].id);
  }, [moments, deepLinkedId, selectedId]);

  const selectedMoment = moments.find((item) => item.id === selectedId) ?? null;

  const onSelect = (id: string) => {
    setSelectedId(id);
    // On desktop the sticky pane already shows it; below lg there is no pane,
    // so the moment opens in a sheet instead
    if (!isDesktop) setIsSheetOpen(true);
  };

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
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="lg:col-span-8">
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
                    selectedId={selectedId}
                    onSelect={onSelect}
                    // Only the last run reads on to the next page, so the paging
                    // sentinel sits at the foot of the feed
                    onLoadMore={fetchNextPage}
                    hasMore={isLast && Boolean(hasNextPage)}
                    isLoadingMore={isLast && isFetchingNextPage}
                  />
                  {!isLast && interestCategories[runIndex] && (
                    <MomentsBreakRail category={interestCategories[runIndex]} />
                  )}
                </Fragment>
              );
            })}
          </div>

          <div className="hidden lg:col-span-4 lg:block">
            <div className="sticky top-6 max-h-[calc(100vh-3rem)] overflow-y-auto pr-1">
              {selectedMoment ? (
                <MomentDetail key={selectedMoment.id} moment={selectedMoment} />
              ) : (
                <p className="text-sm text-gray-400">Pick a moment to see the story behind it.</p>
              )}
            </div>
          </div>
        </div>
      )}

      <Drawer
        isOpen={isSheetOpen && !isDesktop && Boolean(selectedMoment)}
        setIsOpen={setIsSheetOpen}
      >
        <div className="px-4 pb-8 pt-4">
          {selectedMoment && <MomentDetail key={selectedMoment.id} moment={selectedMoment} />}
        </div>
      </Drawer>
    </PageContainer>
  );
};
