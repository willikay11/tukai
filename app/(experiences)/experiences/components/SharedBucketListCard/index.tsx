'use client';

import { PhotoImage } from '@/app/shared/components/Images';
import { useJoinBucketList } from '@/app/shared/hooks/useBucketLists';
import { Button } from '@/components/ui/button';
import { BucketList } from '@/types/bucket-list';
import { linkedUserName } from '@/types/user';

interface SharedBucketListCardProps {
  bucketList: BucketList;
}

export const SharedBucketListCard = ({ bucketList }: SharedBucketListCardProps) => {
  const { mutate: joinBucketList, isPending } = useJoinBucketList();

  // The list serializer sends this as a string, so it is read loosely
  const isJoined = Boolean(bucketList.isMember) && bucketList.isMember !== 'false';

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div className="relative h-[200px]">
        <PhotoImage
          src={bucketList.coverImage}
          alt={bucketList.name}
          fill
          sizes="(max-width: 768px) 100vw, 400px"
          className="object-cover"
        />
      </div>

      <div className="flex items-center justify-between p-4">
        <div>
          <p className="text-base font-bold text-gray-900">{bucketList.name}</p>
          <p className="mt-0.5 text-sm text-gray-400">
            By {linkedUserName(bucketList.owner)} · {bucketList.itemCount} saved
          </p>
        </div>

        {/* Joining is done with the share token the list was handed out on */}
        <Button
          onClick={() => bucketList.shareToken && joinBucketList(bucketList.shareToken)}
          disabled={isPending || isJoined || !bucketList.shareToken}
          className="flex-shrink-0 rounded-full px-6"
        >
          {isJoined ? 'Joined' : 'Join'}
        </Button>
      </div>
    </div>
  );
};
