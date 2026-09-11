import Link from 'next/link';

import { IconComponent } from '@/app/shared/components/Icons';
import { PhotoImage } from '@/app/shared/components/Images';
import { CARD_LIFT, MEDIA_ZOOM, TITLE_TINT } from '@/app/shared/components/Motion';
import { cn } from '@/lib/utils';
import { BucketList, bucketListCoverPhoto } from '@/types/bucket-list';
import { linkedUserName } from '@/types/user';

interface BucketListCardProps {
  bucketList: BucketList;
  /** Given one, the card is a link; otherwise the caller handles the press. */
  href?: string;
  onClick?: () => void;
}

const CardBody = ({ bucketList }: { bucketList: BucketList }) => (
  <>
    <div className="relative h-[220px]">
      <PhotoImage
        src={bucketListCoverPhoto(bucketList)}
        alt={bucketList.name}
        fill
        sizes="(max-width: 768px) 100vw, 400px"
        className={cn('object-cover', MEDIA_ZOOM)}
      />

      <div className="absolute left-3 top-3 rounded-full bg-white px-3 py-1 text-xs font-medium text-gray-900">
        {bucketList.visibility === 'public' ? 'Public' : 'Private'}
      </div>
    </div>

    <div className="p-4">
      <p className={cn('text-base font-bold text-gray-900', TITLE_TINT)}>{bucketList.name}</p>

      {bucketList.owner && (
        <p className="mt-0.5 text-xs text-gray-400">by {linkedUserName(bucketList.owner)}</p>
      )}

      <div className="mt-2 flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-sm text-gray-600">
          <IconComponent iconName="ShoppingBasket01Icon" size={14} className="text-primary" />
          {bucketList.itemCount} saved
        </span>

        {bucketList.memberCount > 0 && (
          <span className="flex items-center gap-1.5 text-sm text-gray-500">
            <IconComponent iconName="UserMultipleIcon" size={14} color="currentColor" />
            {bucketList.memberCount}
          </span>
        )}
      </div>
    </div>
  </>
);

export const BucketListCard = ({ bucketList, href, onClick }: BucketListCardProps) => {
  const shell = cn(
    'group block cursor-pointer overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md',
    CARD_LIFT,
  );

  if (href) {
    return (
      <Link href={href} className={shell}>
        <CardBody bucketList={bucketList} />
      </Link>
    );
  }

  return (
    <div onClick={onClick} className={shell}>
      <CardBody bucketList={bucketList} />
    </div>
  );
};
