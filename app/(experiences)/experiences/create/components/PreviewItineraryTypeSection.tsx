'use client';

import { IconComponent } from '@/app/shared/components/Icons';

interface PreviewItineraryTypeSectionProps {
  visibility: 'public' | 'private';
  onEdit?: () => void;
}

export const PreviewItineraryTypeSection = ({ visibility, onEdit }: PreviewItineraryTypeSectionProps) => {
  const visibilityLabel = visibility === 'public' ? 'Public' : 'Private';

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between">
        <h3 className="text-xs font-semibold text-gray-900">Visibility</h3>
        {onEdit && (
          <button onClick={onEdit} className="text-gray-400 hover:text-gray-600">
            <IconComponent iconName="Edit02Icon" size={16} />
          </button>
        )}
      </div>
      <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2.5">
        <IconComponent iconName="UserIcon" size={18} className="text-gray-600" />
        <p className="text-xs text-gray-700">{visibilityLabel}</p>
      </div>
    </div>
  );
};
