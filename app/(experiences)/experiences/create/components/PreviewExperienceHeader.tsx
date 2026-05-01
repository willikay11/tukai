'use client';

import { IconComponent } from '@/app/shared/components/Icons';
import { ImageCarousel } from '@/components/ui/imageCarousel';

interface PreviewExperienceHeaderProps {
  photo: string | null;
  photos?: string[];
  title: string;
  description: string;
  onEdit?: () => void;
}

export const PreviewExperienceHeader = ({ photo, photos, title, description, onEdit }: PreviewExperienceHeaderProps) => {
  // Use photos array if provided, otherwise fall back to single photo
  const imagesToDisplay = (photos && photos.length > 0) ? photos : (photo ? [photo] : []);
  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between">
        <h3 className="text-xs font-semibold text-gray-900">Experience Title & Photo</h3>
        {onEdit && (
          <button onClick={onEdit} className="text-gray-400 hover:text-gray-600">
            <IconComponent iconName="Edit02Icon" size={16} />
          </button>
        )}
      </div>
      {imagesToDisplay.length > 0 ? (
        <div className="space-y-2">
          {imagesToDisplay.length > 1 ? (
            <ImageCarousel
              images={imagesToDisplay}
              width="w-full"
              aspectRatio="aspect-[4/3]"
              className="h-40"
            />
          ) : (
            <img src={imagesToDisplay[0]} alt={title || 'Experience'} className="h-40 w-full rounded-lg object-cover" />
          )}
          {(title || description) && (
            <div>
              {title && <p className="text-sm font-bold text-gray-900">{title}</p>}
              {description && (
                <div
                  className="text-xs text-gray-600 prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: description }}
                />
              )}
            </div>
          )}
        </div>
      ) : (
        <p className="text-xs text-gray-500">Not set yet</p>
      )}
    </div>
  );
};
