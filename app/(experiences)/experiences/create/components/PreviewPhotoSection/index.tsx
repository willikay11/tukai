'use client';

import Image from 'next/image';

import { IconComponent } from '@/app/shared/components/Icons';
import { ImageCarousel } from '@/components/ui/imageCarousel';

interface PreviewPhotoSectionProps {
  photos?: string[];
  onEdit?: () => void;
}

export const PreviewPhotoSection = ({ photos, onEdit }: PreviewPhotoSectionProps) => {
  const imagesToDisplay = photos && photos.length > 0 ? photos : [];

  return (
    <div className="relative space-y-3">
      {imagesToDisplay.length > 0 ? (
        <div className="space-y-4">
          {imagesToDisplay.length > 1 ? (
            <ImageCarousel
              images={imagesToDisplay}
              width="w-full"
              aspectRatio="aspect-[4/3]"
              className="h-40"
            />
          ) : (
            <div className="relative h-40 w-full overflow-hidden rounded-lg">
              <Image
                src={imagesToDisplay[0]}
                alt="Experience"
                fill
                sizes="(max-width: 768px) 100vw, 560px"
                className="object-cover"
                priority
              />
            </div>
          )}
        </div>
      ) : (
        <div className="relative flex flex-col items-center justify-center rounded-lg bg-gray-50 py-12">
          <IconComponent iconName="Album02Icon" size={28} className="mb-2 text-gray-400" />
          <p className="text-xs font-normal text-gray-900">No image available</p>
          {onEdit && (
            <button
              onClick={onEdit}
              className="mt-3 rounded-[50px] bg-emerald-500 px-6 py-2 text-xs font-medium text-white transition-colors hover:bg-emerald-600"
            >
              Add photos
            </button>
          )}
        </div>
      )}

      {onEdit && imagesToDisplay.length > 0 && (
        <button
          onClick={onEdit}
          className="absolute bottom-2 right-2 text-gray-400 hover:text-gray-600"
        >
          <IconComponent iconName="Edit02Icon" size={16} className="text-gray-800" />
        </button>
      )}
    </div>
  );
};
