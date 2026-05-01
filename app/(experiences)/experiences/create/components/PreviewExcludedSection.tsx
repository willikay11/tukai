'use client';

import { IconComponent } from '@/app/shared/components/Icons';

interface PreviewExcludedSectionProps {
  items: string[];
  onEdit?: () => void;
}

export const PreviewExcludedSection = ({ items, onEdit }: PreviewExcludedSectionProps) => {
  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between">
        <h3 className="text-xs font-semibold text-gray-900">What's Not Included</h3>
        {onEdit && (
          <button onClick={onEdit} className="text-gray-400 hover:text-gray-600">
            <IconComponent iconName="Edit02Icon" size={16} />
          </button>
        )}
      </div>
      {items.length > 0 ? (
        <div className="rounded-lg bg-red-50 px-3 py-3">
          <div className="flex items-start gap-2">
            <IconComponent iconName="CancelCircleIcon" size={18} className="mt-0.5 flex-shrink-0 text-red-600" />
            <div className="flex-1 text-xs text-gray-700 prose prose-sm max-w-none">
              {items.map((item, index) => (
                <div key={index} dangerouslySetInnerHTML={{ __html: item }} className="mb-1" />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <p className="text-xs text-gray-500">Not set yet</p>
      )}
    </div>
  );
};
