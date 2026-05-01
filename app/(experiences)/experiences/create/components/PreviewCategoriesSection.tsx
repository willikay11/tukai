'use client';

import { IconComponent } from '@/app/shared/components/Icons';

interface PreviewCategoriesSectionProps {
  categories: string[];
  onEdit?: () => void;
}

export const PreviewCategoriesSection = ({ categories, onEdit }: PreviewCategoriesSectionProps) => {
  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between">
        <h3 className="text-xs font-semibold text-gray-900">Categories</h3>
        {onEdit && (
          <button onClick={onEdit} className="text-gray-400 hover:text-gray-600">
            <IconComponent iconName="Edit02Icon" size={16} />
          </button>
        )}
      </div>
      {categories.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {categories.map((category, index) => (
            <span
              key={index}
              className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700"
            >
              {category}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-xs text-gray-500">Not set yet</p>
      )}
    </div>
  );
};
