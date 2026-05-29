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
          <svg
            width="64"
            height="64"
            viewBox="0 0 120 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="mb-3 text-gray-400"
          >
            <circle cx="60" cy="60" r="58" stroke="currentColor" strokeWidth="4" />
            <path
              d="M45 50C45 45.58 48.58 42 53 42C57.42 42 61 45.58 61 50C61 54.42 57.42 58 53 58C48.58 58 45 54.42 45 50Z"
              fill="currentColor"
            />
            <path
              d="M35 68C35 63.58 40.82 60 48 60H68C75.18 60 81 63.58 81 68V88C81 92.42 77.42 96 73 96H39C34.58 96 31 92.42 31 88V72C31 69.79 32.79 68 35 68Z"
              fill="currentColor"
            />
          </svg>
          <p className="text-sm font-medium text-gray-900">No image available</p>
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
