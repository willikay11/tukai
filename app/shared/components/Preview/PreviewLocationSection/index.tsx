'use client';

import { IconComponent } from '@/app/shared/components/Icons';
import { PhotoImage } from '@/app/shared/components/Images';

interface PreviewLocationSectionProps {
  location: string | null;
  // Tukai place photo — Google picks have none and keep the icon tile
  imageUrl?: string | null;
  label?: string;
  onEdit?: () => void;
}

export const PreviewLocationSection = ({
  location,
  imageUrl = null,
  label = 'Experience Location',
  onEdit,
}: PreviewLocationSectionProps) => {
  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between">
        <h3 className="text-xs font-semibold text-gray-900">{label}</h3>
        {onEdit && (
          <button onClick={onEdit} className="text-gray-400 hover:text-gray-600">
            <IconComponent iconName="Edit02Icon" size={16} className="text-gray-800" />
          </button>
        )}
      </div>
      {location ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {imageUrl ? (
              <div className="relative h-[60px] w-[60px] flex-shrink-0 overflow-hidden rounded-[12px]">
                <PhotoImage
                  src={imageUrl}
                  alt={location}
                  fill
                  sizes="60px"
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="rounded-[12px] bg-gray-100 p-4">
                <IconComponent iconName="Image02Icon" size={28} className="text-gray-600" />
              </div>
            )}
            <p className="text-xs font-medium text-gray-800">{location}</p>
          </div>
        </div>
      ) : (
        <p className="text-xs text-gray-500">Not set yet</p>
      )}
    </div>
  );
};
