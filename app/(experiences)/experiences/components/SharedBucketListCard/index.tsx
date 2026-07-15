'use client';

import Image from 'next/image';

import { useJoinBucketList } from '@/app/shared/hooks/useBucketLists';
import { Button } from '@/components/ui/button';
import { BucketList } from '@/types/bucket-list';

interface SharedBucketListCardProps {
  bucketList: BucketList;
}

export const SharedBucketListCard = ({ bucketList }: SharedBucketListCardProps) => {
  const { mutate: joinBucketList, isPending } = useJoinBucketList();

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div className="relative h-[200px]">
        {bucketList.coverPhoto ? (
          <Image
            src={bucketList.coverPhoto}
            alt={bucketList.title}
            fill
            sizes="(max-width: 768px) 100vw, 400px"
            className="object-cover"
          />
        ) : (
          <div className="h-full w-full bg-gray-200" />
        )}
      </div>

      <div className="flex items-center justify-between p-4">
        <div>
          <p className="text-base font-bold text-gray-900">{bucketList.title}</p>
          <p className="mt-0.5 text-sm text-gray-400">
            By {bucketList.owner.name} · {bucketList.savedCount} saved
          </p>
        </div>

        <Button
          onClick={() => joinBucketList(bucketList.id)}
          disabled={isPending || bucketList.hasJoined}
          className="flex-shrink-0 rounded-full px-6"
        >
          {bucketList.hasJoined ? 'Joined' : 'Join'}
        </Button>
      </div>
    </div>
  );
};
