'use client';

import { IconComponent } from '@/app/shared/components/Icons';

interface PreviewIncludedSectionProps {
  items: string[];
  onEdit?: () => void;
}

export const PreviewIncludedSection = ({ items, onEdit }: PreviewIncludedSectionProps) => {
  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between">
        <h3 className="text-xs font-semibold text-gray-900">What's Included</h3>
        {onEdit && (
          <button onClick={onEdit} className="text-gray-400 hover:text-gray-600">
            <IconComponent iconName="Edit02Icon" size={16} />
          </button>
        )}
      </div>
      {items.length > 0 ? (
        <div className="rounded-lg bg-emerald-50 px-3 py-3">
          <div className="flex items-start gap-2">
            <IconComponent iconName="FavouriteIcon" size={18} className="mt-0.5 flex-shrink-0 text-emerald-600" />
            <ul className="space-y-1 text-xs text-gray-700">
              {items.map((item, index) => (
                <li key={index} className="leading-relaxed">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <p className="text-xs text-gray-500">Not set yet</p>
      )}
    </div>
  );
};
