'use client';

import { IconComponent } from '@/app/shared/components/Icons';

interface PreviewItineraryTypeSectionProps {
  visibility: 'public' | 'private';
  onEdit?: () => void;
}

export const PreviewItineraryTypeSection = ({
  visibility,
  onEdit,
}: PreviewItineraryTypeSectionProps) => {
  const visibilityLabel = visibility === 'public' ? 'Public' : 'Private';

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between">
        <h3 className="text-xs font-semibold text-gray-900">Visibility</h3>
        {onEdit && (
          <button onClick={onEdit} className="text-gray-400 hover:text-gray-600">
            <IconComponent iconName="Edit02Icon" size={16} className="text-gray-800" />
          </button>
        )}
      </div>
      <div className="flex items-center gap-2">
        <IconComponent iconName="UserIcon" size={18} className="text-gray-800" />
        <p className="text-xs font-medium text-gray-800">{visibilityLabel}</p>
      </div>
    </div>
  );
};
