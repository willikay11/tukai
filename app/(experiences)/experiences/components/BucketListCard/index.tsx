import { IconComponent } from '@/app/shared/components/Icons';
import { PhotoImage } from '@/app/shared/components/Images';
import { BucketList } from '@/types/bucket-list';

import { AvatarStack } from '../AvatarStack';

interface BucketListCardProps {
  bucketList: BucketList;
  onClick: () => void;
}

export const BucketListCard = ({ bucketList, onClick }: BucketListCardProps) => (
  <div
    onClick={onClick}
    className="cursor-pointer overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md"
  >
    {/* Cover */}
    <div className="relative h-[220px]">
      <PhotoImage
        src={bucketList.coverPhoto}
        alt={bucketList.title}
        fill
        sizes="(max-width: 768px) 100vw, 400px"
        className="object-cover"
      />

      {/* Public/Private badge */}
      <div className="absolute left-3 top-3 rounded-full bg-white px-3 py-1 text-xs font-medium text-gray-900">
        {bucketList.isPublic ? 'Public' : 'Private'}
      </div>

      {/* Preview thumbnails */}
      {bucketList.previewPhotos.length > 0 && (
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
          {bucketList.previewPhotos.slice(0, 4).map((photo, index) => (
            <div
              key={index}
              className="relative h-11 w-11 overflow-hidden rounded-lg ring-2 ring-white/90"
            >
              <PhotoImage src={photo} alt="" fill sizes="44px" className="object-cover" />
            </div>
          ))}
          {bucketList.savedCount > 4 && (
            <span className="ml-1 text-sm font-medium text-white drop-shadow">
              +{bucketList.savedCount - 4}
            </span>
          )}
        </div>
      )}
    </div>

    {/* Footer */}
    <div className="p-4">
      <p className="text-base font-bold text-gray-900">{bucketList.title}</p>

      <div className="mt-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <IconComponent iconName="ShoppingBasket01Icon" size={14} className="text-primary" />
          <span className="text-sm text-gray-600">{bucketList.savedCount} saved</span>
        </div>

        <AvatarStack users={bucketList.members} max={3} />
      </div>
    </div>
  </div>
);
