'use client';

import { MouseEvent } from 'react';

import Link from 'next/link';

import { AvatarStack } from '@/app/(experiences)/experiences/components/AvatarStack';
import { savedLine } from '@/app/(experiences)/experiences/components/BucketListCard/bucket-list-card';
import { IconComponent } from '@/app/shared/components/Icons';
import { PhotoImage } from '@/app/shared/components/Images';
import { useBucketListDrawer } from '@/context/BucketListDrawerContext';
import { BucketList, bucketListCoverPhoto } from '@/types/bucket-list';
import { linkedUserName } from '@/types/user';

export const BucketListProfileRow = ({ bucketList, isOwn }: { bucketList: BucketList; isOwn: boolean }) => {
  const drawer = useBucketListDrawer();
  const owner = bucketList.owner;
  const ownerName = owner ? linkedUserName(owner) : '';
  const faces = owner ? [{ id: owner.id, name: ownerName, picture: owner.picture }] : [];

  const handleOpen = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!drawer) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    event.preventDefault();
    event.stopPropagation();
    event.nativeEvent.stopImmediatePropagation();
    drawer.openBucketList(bucketList.id);
  };

  return (
    <Link
      href={`/bucket-lists/${bucketList.id}`}
      onClick={handleOpen}
      className="flex min-w-0 items-start gap-2.5"
    >
      <span className="relative block h-[62px] w-[62px] flex-shrink-0 overflow-hidden rounded-xl bg-surface">
        <PhotoImage
          src={bucketListCoverPhoto(bucketList)}
          alt={bucketList.name}
          fill
          sizes="62px"
          className="object-cover"
        />

        {bucketList.visibility === 'private' && (
          <span className="absolute bottom-[5px] left-[5px] flex h-[22px] w-[22px] items-center justify-center rounded-[6px] bg-lime text-brand-ink">
            <IconComponent iconName="SquareLock02Icon" size={13} color="currentColor" />
          </span>
        )}
      </span>

      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="block text-sm font-semibold leading-[1.3] text-brand-ink">
            {bucketList.name}
          </span>
          {ownerName && (
            <span className="truncate text-[12.5px] leading-[1.35] text-ink-muted">
              {isOwn ? 'Your progress is private' : (
                <>
                  By <span className="font-semibold text-gray-900">{ownerName}</span>
                </>
              )}
            </span>
          )}
        </div>

        <div className="flex min-w-0 flex-wrap items-center gap-2">
          {faces.length > 0 && (
            <>
              <AvatarStack
                users={faces}
                max={1}
                size="sm"
                plainOverflow
                extraCount={Math.max((bucketList.memberCount ?? 0) - faces.length, 0)}
              />
              <span aria-hidden="true" className="h-1 w-1 flex-shrink-0 rounded-full bg-dot-profile" />
            </>
          )}
          <span className="flex flex-shrink-0 items-center gap-1 text-xs font-semibold text-ink-muted">
            <IconComponent iconName="ShoppingBasketAdd02Icon" size={15} color="currentColor" />
            {savedLine(bucketList)}
          </span>
        </div>
      </div>
    </Link>
  );
};
