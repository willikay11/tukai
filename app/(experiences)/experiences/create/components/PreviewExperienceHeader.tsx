'use client';

import { IconComponent } from '@/app/shared/components/Icons';

interface PreviewExperienceHeaderProps {
  photo: string | null;
  title: string;
  description: string;
  onEdit?: () => void;
}

export const PreviewExperienceHeader = ({ photo, title, description, onEdit }: PreviewExperienceHeaderProps) => {
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
      {photo && title ? (
        <div className="space-y-2">
          {photo && (
            <img src={photo} alt={title} className="h-40 w-full rounded-lg object-cover" />
          )}
          <div>
            <p className="text-sm font-bold text-gray-900">{title}</p>
            <p className="line-clamp-2 text-xs text-gray-600">{description}</p>
          </div>
        </div>
      ) : (
        <p className="text-xs text-gray-500">Not set yet</p>
      )}
    </div>
  );
};
