'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import { useSearchParams } from 'next/navigation';

import { PageContainer } from '@/app/shared/components/Layout';
import { MomentCard, MomentCardSkeleton, MomentDrawer } from '@/app/shared/components/Moments';
import { useInfiniteMoments } from '@/app/shared/hooks/useMoments';
import { cn } from '@/lib/utils';
import { Moment, momentPhotos } from '@/types/moment';

import { MomentsShowMore } from './components/MomentsShowMore';
import { PopularRail } from './components/PopularRail';
import {
  BLOCKS_PER_PAGE,
  DEFAULT_FEED_COLUMNS,
  blockSize,
  layoutFeed,
  popularRailAt,
} from './feed-blocks';
import { useGridColumns } from './hooks/useGridColumns';
import { usePopularRails } from './hooks/usePopularRails';

/**
 * Cards as wide as fit at 240px or more: five across the full page, four in a
 * laptop window, one on a phone.
 */
const FEED_GRID =
  'mt-[22px] grid grid-cols-[repeat(auto-fill,minmax(min(100%,240px),1fr))] items-start gap-x-5 gap-y-[30px]';

/** A page of the API covers a page of the feed at five columns. */
const FEED_PAGE_SIZE = 30;

/** Roughly the first screenful across the layouts. */
const EAGER_CARDS = 5;

const MESSAGE = 'text-[14.5px] leading-normal text-ink-note [text-wrap:pretty]';

/** The feed failed with nothing to show: say so, and offer another go. */
const RetryButton = ({ onClick }: { onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className="inline-flex h-11 items-center whitespace-nowrap rounded-full bg-surface px-5 text-[14.5px] font-bold text-brand transition-colors hover:bg-surface-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
  >
    Try again
  </button>
);

export const MomentsView = () => {
  const searchParams = useSearchParams();
  const deepLinkedId = searchParams.get('momentId');

  const { data, isLoading, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteMoments(FEED_PAGE_SIZE);
  const [openMoment, setOpenMoment] = useState<Moment | null>(null);
  const [extraPages, setExtraPages] = useState(0);
  const hasOpenedDeepLink = useRef(false);

  // Blocks end on a full row, so their size follows the columns the grid
  // actually settled on
  const { ref: gridRef, columns } = useGridColumns(DEFAULT_FEED_COLUMNS);
  const size = blockSize(columns);
  const shownCount = size * BLOCKS_PER_PAGE * (1 + extraPages);

  // The feed is photo-led. A moment with no media - or whose only media is a
  // video / still-processing upload with photo: null - has nothing to show, and
  // would crash next/image if it reached one.
  const moments: Moment[] = useMemo(
    () =>
      (data?.pages ?? [])
        .flatMap((page) => (page?.data?.results ?? []) as Moment[])
        .filter((item) => momentPhotos(item).length > 0),
    [data],
  );
  const shown = moments.slice(0, shownCount);

  // The API pages by request and the feed by block, so keep reading until the
  // blocks on screen are full or there is nothing left
  useEffect(() => {
    if (moments.length < shownCount && hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [moments.length, shownCount, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const hasMore = moments.length > shownCount || Boolean(hasNextPage);
  const rails = usePopularRails(moments.length > size);

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
      <h1 className="text-[22px] font-bold leading-tight tracking-[-0.3px] text-brand-ink">
        Moments
      </h1>

      {isLoading ? (
        // The same grid as the feed, measured the same way, so the page does
        // not reflow when the moments arrive
        <div ref={gridRef} className={FEED_GRID}>
          {Array.from({ length: size }, (_, index) => (
            <MomentCardSkeleton key={index} />
          ))}
        </div>
      ) : isError && moments.length === 0 ? (
        <div className="mt-5 flex flex-col items-start gap-4">
          <p className={MESSAGE}>Moments did not load.</p>
          <RetryButton onClick={() => refetch()} />
        </div>
      ) : moments.length === 0 ? (
        <p className={cn('mt-5', MESSAGE)}>No moments yet. Yours could be the first.</p>
      ) : (
        <>
          <div ref={gridRef} data-testid="moments-feed" className={FEED_GRID}>
            {layoutFeed(shown, size).map((entry, index) =>
              entry.kind === 'card' ? (
                <MomentCard
                  key={entry.item.id}
                  moment={entry.item}
                  priority={index < EAGER_CARDS}
                  onClick={() => setOpenMoment(entry.item)}
                  className="w-full"
                />
              ) : (
                // Keyed by position, so each rail keeps its page as more
                // cards load beneath it
                <PopularRail
                  key={`rail-${entry.index}`}
                  rail={rails[popularRailAt(entry.index)]}
                />
              ),
            )}
          </div>

          {hasMore && (
            <div className="mt-[30px] flex justify-center">
              <MomentsShowMore
                isLoading={isFetchingNextPage}
                onClick={() => setExtraPages((pages) => pages + 1)}
              />
            </div>
          )}
        </>
      )}

      <MomentDrawer moment={openMoment} onClose={() => setOpenMoment(null)} />
    </PageContainer>
  );
};
