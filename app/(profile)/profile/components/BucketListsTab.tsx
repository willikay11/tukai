'use client';

import Link from 'next/link';

import { isSharedWithMe, useMyBucketLists } from '@/app/shared/hooks/useBucketLists';
import { BucketList } from '@/types/bucket-list';

import { BucketListProfileRow } from './BucketListProfileRow';

const EmptyPanel = ({ message, cta, href }: { message: string; cta: string; href: string }) => (
  <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-surface px-5 py-[18px]">
    <span className="text-sm text-ink-muted">{message}</span>
    <Link
      href={href}
      className="h-11 whitespace-nowrap rounded-full border border-line px-[18px] text-sm font-semibold leading-[44px] text-brand-ink"
    >
      {cta}
    </Link>
  </div>
);

export const BucketListsTab = ({ userId }: { userId?: string | null }) => {
  const { data, isLoading } = useMyBucketLists(Boolean(userId));

  const all: BucketList[] = data?.data?.results ?? [];
  const mine = all.filter((list) => !isSharedWithMe(list, userId));
  const following = all.filter((list) => isSharedWithMe(list, userId));

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="h-[62px] animate-pulse rounded-xl bg-gray-100" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-7">
      <div>
        <h2 className="text-19 font-bold tracking-[-0.3px] text-brand-ink">
          Made by you{mine.length > 0 && ` (${mine.length})`}
        </h2>
        <p className="mt-1 text-[13.5px] text-ink-muted">
          Your progress stays private, even on a public list.
        </p>

        {mine.length > 0 ? (
          <div className="mt-5 grid grid-cols-[repeat(auto-fill,minmax(max(190px,(100%_-_40px)/3),1fr))] gap-x-5 gap-y-6">
            {mine.map((list) => (
              <BucketListProfileRow key={list.id} bucketList={list} isOwn />
            ))}
          </div>
        ) : (
          <div className="mt-3.5">
            <EmptyPanel message="No bucket lists yet." cta="Discover bucket lists" href="/bucket-lists" />
          </div>
        )}
      </div>

      <div>
        <h2 className="text-19 font-bold tracking-[-0.3px] text-brand-ink">
          Following{following.length > 0 && ` (${following.length})`}
        </h2>
        <p className="mt-1 text-[13.5px] text-ink-muted">
          Following a list never books anything on it.
        </p>

        {following.length > 0 ? (
          <div className="mt-5 grid grid-cols-[repeat(auto-fill,minmax(max(190px,(100%_-_40px)/3),1fr))] gap-x-5 gap-y-6">
            {following.map((list) => (
              <BucketListProfileRow key={list.id} bucketList={list} isOwn={false} />
            ))}
          </div>
        ) : (
          <div className="mt-3.5">
            <EmptyPanel message="No bucket lists yet." cta="Discover bucket lists" href="/bucket-lists" />
          </div>
        )}
      </div>
    </div>
  );
};
