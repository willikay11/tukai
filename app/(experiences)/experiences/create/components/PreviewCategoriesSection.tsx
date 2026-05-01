'use client';

import { IconComponent } from '@/app/shared/components/Icons';
import { Interest } from '@/types/interest';
import { ca } from 'date-fns/locale';

interface PreviewCategoriesSectionProps {
  categories: Interest[];
  onEdit?: () => void;
}

export const PreviewCategoriesSection = ({ categories, onEdit }: PreviewCategoriesSectionProps) => {
  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between">
        <h3 className="text-xs font-semibold text-gray-900">Categories</h3>
        {onEdit && (
          <button onClick={onEdit} className="text-gray-400 hover:text-gray-600">
            <IconComponent iconName="Edit02Icon" size={16} className='text-gray-800' />
          </button>
        )}
      </div>
      {categories.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {categories.map((category, index) => (
            <div
              key={index}
              className="flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs text-gray-700"
            >
              {category.icon && <IconComponent iconName={category.icon} size={14} className="flex-shrink-0" />}
              <span>{category.name}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-gray-500">Not set yet</p>
      )}
    </div>
  );
};
