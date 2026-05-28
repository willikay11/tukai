'use client';

import Image from 'next/image';

import { IconComponent } from '@/app/shared/components/Icons';
import { ImageCarousel } from '@/components/ui/imageCarousel';
import { Button } from '@/components/ui/button';

interface PreviewExperienceHeaderProps {
  photos?: string[];
  title: string;
  description: string;
  onEdit?: () => void;
}

export const PreviewExperienceHeader = ({
  photos,
  title,
  description,
  onEdit,
}: PreviewExperienceHeaderProps) => {
  // Use photos array if provided, otherwise fall back to single photo
  const imagesToDisplay = photos && photos.length > 0 ? photos : [];

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between"></div>
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
                alt={title || 'Experience'}
                fill
                sizes="(max-width: 768px) 100vw, 560px"
                className="object-cover"
                priority
              />
            </div>
          )}
          {(title || description) && (
            <div>
              {title && (
                <div className="flex flex-row justify-between">
                  <p className="text-xl font-bold text-gray-900">{title}</p>
                  {onEdit && (
                    <button onClick={onEdit} className="text-gray-400 hover:text-gray-600">
                      <IconComponent iconName="Edit02Icon" size={16} className="text-gray-800" />
                    </button>
                  )}
                </div>
              )}
              {description && (
                <div
                  className="prose prose-sm mt-4 max-w-none text-xs text-gray-600"
                  dangerouslySetInnerHTML={{ __html: description }}
                />
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg bg-gray-50 py-12">
          <p className="text-xs font-normal text-gray-900">No image available</p>
          {onEdit && (
            <Button
              variant="link"
              onClick={onEdit}
              className="mt-3"
            >
              Add photos
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
