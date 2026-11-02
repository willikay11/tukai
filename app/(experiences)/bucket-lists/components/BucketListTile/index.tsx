'use client';

import { forwardRef } from 'react';

import { IconComponent } from '@/app/shared/components/Icons';
import { PhotoImage } from '@/app/shared/components/Images';
import { useBucketListDrawer } from '@/context/BucketListDrawerContext';
import { BucketList, bucketListCoverPhoto } from '@/types/bucket-list';
import { linkedUserName } from '@/types/user';
import { canvasIcon } from '@/utils/canvas-icons';

import {
  BucketListTileMode,
  tileAccessibleName,
  tileFaces,
  tileSavedLine,
  visibilityLabel,
} from './bucket-list-tile';

/**
 * One list on the Bucket lists page: a 62px photo beside the title, a sub
 * line, and its members and saved count. The whole card is one button, named
 * in full, and opens the list as a new panel.
 */
export const BucketListTile = forwardRef<
  HTMLButtonElement,
  { bucketList: BucketList; mode: BucketListTileMode }
>(({ bucketList, mode }, ref) => {
  const drawer = useBucketListDrawer();
  const { faces, extra, count } = tileFaces(bucketList);
  const isPrivate = bucketList.visibility === 'private';

  return (
    <button
      ref={ref}
      type="button"
      onClick={() => drawer?.openBucketList(bucketList.id)}
      aria-label={tileAccessibleName(bucketList, mode)}
      className="flex w-full min-w-0 items-start gap-2.5 rounded-xl text-left outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-4"
    >
      <span className="relative h-[62px] w-[62px] flex-shrink-0 overflow-hidden rounded-xl bg-surface">
        <PhotoImage
          src={bucketListCoverPhoto(bucketList)}
          alt=""
          fill
          sizes="62px"
          className="object-cover"
        />
        {isPrivate && (
          <span className="absolute bottom-[5px] left-[5px] flex h-[22px] w-[22px] items-center justify-center rounded-md bg-lime text-brand-ink">
            <IconComponent
              iconName={canvasIcon('hgi-square-lock-02')!}
              size={13}
              color="currentColor"
            />
          </span>
        )}
      </span>

      <span className="flex min-w-0 flex-1 flex-col gap-1.5">
        <span className="flex min-w-0 flex-col gap-0.5">
          <span className="block text-sm font-semibold leading-[1.3] text-brand-ink [text-wrap:pretty]">
            {bucketList.name}
          </span>
          <span className="text-[12.5px] leading-[1.35] text-ink-muted">
            {mode === 'visibility' ? (
              visibilityLabel(bucketList)
            ) : (
              <>
                By{' '}
                <span className="font-semibold text-gray-800">
                  {linkedUserName(bucketList.owner)}
                </span>
              </>
            )}
          </span>
        </span>

        <span className="flex min-w-0 flex-nowrap items-center gap-2">
          {count > 0 && (
            <>
              {faces.length > 0 ? (
                <span className="flex flex-shrink-0 pl-[7px]">
                  {faces.map((member) => (
                    <span
                      key={member.id}
                      className="relative -ml-[7px] block h-[21px] w-[21px] overflow-hidden rounded-full border-2 border-white bg-surface-brand"
                    >
                      <PhotoImage
                        src={member.user?.picture ?? undefined}
                        alt=""
                        fill
                        sizes="21px"
                        className="object-cover"
                      />
                    </span>
                  ))}
                </span>
              ) : (
                <IconComponent
                  iconName="UserMultipleIcon"
                  size={15}
                  color="currentColor"
                  className="flex-shrink-0 text-ink-muted"
                />
              )}
              {extra > 0 && (
                <span className="flex-shrink-0 text-[12.5px] font-semibold text-ink-muted">
                  {faces.length > 0 ? `+${extra}` : extra}
                </span>
              )}
              <span
                aria-hidden="true"
                className="h-1 w-1 flex-shrink-0 rounded-full bg-dot-profile"
              />
            </>
          )}
          <span className="flex min-w-0 flex-shrink items-center gap-1 text-xs font-semibold text-ink-muted">
            <IconComponent
              iconName={canvasIcon('hgi-shopping-basket-add-02')!}
              size={15}
              color="currentColor"
              className="flex-shrink-0"
            />
            <span className="truncate">{tileSavedLine(bucketList)}</span>
          </span>
        </span>
      </span>
    </button>
  );
});

BucketListTile.displayName = 'BucketListTile';
