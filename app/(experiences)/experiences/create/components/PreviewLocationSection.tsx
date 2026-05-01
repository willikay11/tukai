'use client';

import { IconComponent } from '@/app/shared/components/Icons';

interface PreviewLocationSectionProps {
  location: string | null;
  onEdit?: () => void;
}

export const PreviewLocationSection = ({ location, onEdit }: PreviewLocationSectionProps) => {
  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between">
        <h3 className="text-xs font-semibold text-gray-900">Experience Location</h3>
        {onEdit && (
          <button onClick={onEdit} className="text-gray-400 hover:text-gray-600">
            <IconComponent iconName="Edit02Icon" size={16} />
          </button>
        )}
      </div>
      {location ? (
        <div className="space-y-2">
          <div className="h-16 w-full rounded-lg bg-gray-200" />
          <div className="flex items-center gap-2">
            <IconComponent iconName="MapIcon" size={16} className="text-gray-600" />
            <p className="text-xs text-gray-700">{location}</p>
          </div>
        </div>
      ) : (
        <p className="text-xs text-gray-500">Not set yet</p>
      )}
    </div>
  );
};
