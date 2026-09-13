'use client';

import { IconComponent } from '@/app/shared/components/Icons';

interface PreviewIncludedSectionProps {
  items: string[];
  onEdit?: () => void;
}

export const PreviewIncludedSection = ({ items, onEdit }: PreviewIncludedSectionProps) => {
  return (
    <div className="space-y-3">
      {items.length > 0 ? (
        <div className="rounded-lg bg-emerald-50 px-3 py-3">
          <div className="flex items-start justify-between">
            <div className="inline-flex items-center gap-x-1">
              <IconComponent
                iconName="ThumbsUpIcon"
                size={18}
                className="mt-0.5 flex-shrink-0 text-emerald-600"
              />
              <h3 className="text-xs font-semibold text-gray-800">What's Included</h3>
            </div>
            {onEdit && (
              <button onClick={onEdit} className="text-gray-400 hover:text-gray-600">
                <IconComponent iconName="Edit02Icon" size={16} className="text-gray-800" />
              </button>
            )}
          </div>

          <div className="flex items-start gap-2">
            <div className="prose prose-sm max-w-none flex-1 text-xs text-gray-700">
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
