'use client';

import { PhotoImage } from '@/app/shared/components/Images';
import { useInfinitePublicBucketLists, useMyBucketLists } from '@/app/shared/hooks/useBucketLists';
import { BucketList, bucketListCoverPhoto } from '@/types/bucket-list';

import { BucketListGrid, BucketListGridSkeleton, BucketListSection } from './BucketListGrid';

const FAN_PHOTO = 'absolute overflow-hidden bg-surface-brand';

/**
 * Three photos fanned behind the empty state. They are the covers of the
 * first public lists - real photos from Tukai rather than fixed samples -
 * and fall back to soft green tiles when there are none to borrow.
 */
const FannedCovers = ({ photos }: { photos: (string | undefined)[] }) => (
  <div aria-hidden="true" className="relative h-[176px] w-[210px]">
    <span
      className={`${FAN_PHOTO} left-1.5 top-6 h-[130px] w-[112px] -rotate-[9deg] rounded-2xl shadow-[0_8px_20px_rgba(1,51,52,.16)]`}
    >
      <PhotoImage src={photos[1]} alt="" fill sizes="112px" className="object-cover" />
    </span>
    <span
      className={`${FAN_PHOTO} right-1.5 top-6 h-[130px] w-[112px] rotate-[9deg] rounded-2xl shadow-[0_8px_20px_rgba(1,51,52,.16)]`}
    >
      <PhotoImage src={photos[2]} alt="" fill sizes="112px" className="object-cover" />
    </span>
    <span
      className={`${FAN_PHOTO} left-9 top-1.5 h-[152px] w-[138px] rounded-[18px] border-4 border-white shadow-[0_14px_32px_rgba(1,51,52,.24)]`}
    >
      <PhotoImage src={photos[0]} alt="" fill sizes="138px" className="object-cover" />
    </span>
  </div>
);

/** Every list the reader owns, public or private. There is no Show more. */
export const MyBucketListsTab = ({
  userId,
  onCreate,
}: {
  userId?: string | null;
  onCreate: () => void;
}) => {
  const { data: response, isLoading } = useMyBucketLists(Boolean(userId));
  const lists: BucketList[] = ((response?.data?.results ?? []) as BucketList[]).filter(
    (list) => !list.owner?.id || list.owner.id === userId,
  );

  const { data: publicPages } = useInfinitePublicBucketLists();
  const covers = (publicPages?.pages[0]?.data?.results ?? [])
    .map((list: BucketList) => bucketListCoverPhoto(list))
    .filter(Boolean)
    .slice(0, 3);

  if (userId && isLoading) {
    return (
      <BucketListSection title="Created by you">
        <BucketListGridSkeleton count={4} />
      </BucketListSection>
    );
  }

  if (lists.length > 0) {
    return (
      <BucketListSection title="Created by you">
        <BucketListGrid bucketLists={lists} mode="visibility" />
      </BucketListSection>
    );
  }

  return (
    <div className="mt-7 flex flex-col items-center gap-6 rounded-xl bg-surface px-6 py-9 text-center">
      <FannedCovers photos={covers} />
      <p className="max-w-[34ch] text-[16.5px] leading-[1.55] text-gray-800 [text-wrap:pretty]">
        You don&rsquo;t have anything saved yet. Create a bucket list and share it with your
        friends.
      </p>
      <button
        type="button"
        onClick={onCreate}
        className="h-[52px] w-full max-w-[360px] rounded-full bg-lime text-base font-semibold text-brand-ink transition-colors hover:bg-lime-dark active:scale-[.97]"
      >
        Create bucket list
      </button>
    </div>
  );
};
