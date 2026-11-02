'use client';

import { useFollowingBucketLists } from '@/app/shared/hooks/useBucketLists';
import { BucketList } from '@/types/bucket-list';

import { BucketListGrid, BucketListGridSkeleton, BucketListSection } from './BucketListGrid';

/**
 * Every list the reader joined and does not own, public or private. The
 * invite banner, when there is one, sits above this on the page.
 */
export const FollowingTab = ({
  userId,
  hasInvite,
  onDiscover,
}: {
  userId?: string | null;
  hasInvite: boolean;
  onDiscover: () => void;
}) => {
  const { data: response, isLoading } = useFollowingBucketLists(Boolean(userId));
  const lists: BucketList[] = ((response?.data?.results ?? []) as BucketList[]).filter(
    (list) => list.owner?.id !== userId,
  );

  if (userId && isLoading) {
    return (
      <BucketListSection title="Following">
        <BucketListGridSkeleton count={4} />
      </BucketListSection>
    );
  }

  if (lists.length > 0) {
    return (
      <BucketListSection title="Following">
        <BucketListGrid bucketLists={lists} mode="owner" />
      </BucketListSection>
    );
  }

  if (hasInvite) return null;

  return (
    <div className="mt-7 flex flex-col items-center gap-3.5 rounded-xl bg-surface px-6 py-8 text-center">
      <p className="max-w-[44ch] text-[15.5px] leading-[1.55] text-gray-800 [text-wrap:pretty]">
        You aren&rsquo;t following any bucket lists yet. Join a public list and it shows up here.
      </p>
      <button
        type="button"
        onClick={onDiscover}
        className="h-12 rounded-full bg-lime px-6 text-[15px] font-semibold text-brand-ink transition-colors hover:bg-lime-dark"
      >
        Discover bucket lists
      </button>
    </div>
  );
};
