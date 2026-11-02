'use client';

import { useEffect, useRef, useState } from 'react';

import { IconComponent } from '@/app/shared/components/Icons';
import { useInfinitePublicBucketLists } from '@/app/shared/hooks/useBucketLists';
import { BucketList } from '@/types/bucket-list';

import { BucketListGrid, BucketListGridSkeleton, BucketListSection } from './BucketListGrid';

const PAGE_SIZE = 12;

/**
 * Every public list the reader does not own - the ones they joined included -
 * twelve at a time. Show more adds the next twelve and moves focus to the
 * first of them, so a keyboard reader carries on from where the new ones
 * start rather than back at the top.
 */
export const DiscoverTab = ({ userId }: { userId?: string | null }) => {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfinitePublicBucketLists(PAGE_SIZE);

  const lists: BucketList[] = (data?.pages ?? [])
    .flatMap((page) => (page?.data?.results ?? []) as BucketList[])
    .filter((list) => !userId || list.owner?.id !== userId);

  const tiles = useRef<(HTMLButtonElement | null)[]>([]);
  const [focusFrom, setFocusFrom] = useState<number | null>(null);

  useEffect(() => {
    if (focusFrom === null || lists.length <= focusFrom) return;
    tiles.current[focusFrom]?.focus();
    setFocusFrom(null);
  }, [focusFrom, lists.length]);

  const showMore = () => {
    setFocusFrom(lists.length);
    fetchNextPage();
  };

  return (
    <BucketListSection title="Public bucket lists">
      {isLoading ? (
        <BucketListGridSkeleton />
      ) : lists.length === 0 ? (
        <p className="mt-4 text-[14.5px] text-ink-note">There are no public bucket lists yet.</p>
      ) : (
        <>
          <BucketListGrid
            bucketLists={lists}
            mode="owner"
            tileRef={(index) => (node) => {
              tiles.current[index] = node;
            }}
          />

          {hasNextPage && (
            <button
              type="button"
              onClick={showMore}
              disabled={isFetchingNextPage}
              className="mt-3 inline-flex min-h-11 items-center gap-1.5 self-start text-[14.5px] font-semibold text-brand hover:underline disabled:opacity-60"
            >
              Show more
              <IconComponent iconName="ArrowDown01Icon" size={16} color="currentColor" />
            </button>
          )}
        </>
      )}
    </BucketListSection>
  );
};
