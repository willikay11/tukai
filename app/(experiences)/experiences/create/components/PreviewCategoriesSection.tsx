'use client';

import { IconComponent } from '@/app/shared/components/Icons';

interface PreviewCategoriesSectionProps {
  categories: string[];
  onEdit?: () => void;
}

// Mapping of category names to icon names
const CATEGORY_ICON_MAP: Record<string, string> = {
  'Hiking': 'Mountain02Icon',
  'Cooking': 'ChefHat01Icon',
  'Photography': 'Camera01Icon',
  'Sports': 'Trophy01Icon',
  'Art': 'Palette01Icon',
  'Music': 'Music01Icon',
  'Dance': 'Move01Icon',
  'Yoga': 'Meditation01Icon',
  'Fitness': 'Dumbbell01Icon',
  'Swimming': 'Waves01Icon',
  'Cycling': 'Bike01Icon',
  'Running': 'Run01Icon',
  'Gaming': 'Gamepad01Icon',
  'Reading': 'BookOpen01Icon',
  'Writing': 'Edit02Icon',
  'Meditation': 'Meditation01Icon',
  'Nature': 'Leaf01Icon',
  'Beach': 'Sun02Icon',
  'Mountain': 'Mountain02Icon',
  'Urban': 'Building03Icon',
};

const getIconForCategory = (categoryName: string): string => {
  return CATEGORY_ICON_MAP[categoryName] || 'Tag01Icon';
};

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
            <div
              key={index}
              className="flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs text-gray-700"
            >
              <IconComponent iconName={getIconForCategory(category)} size={14} className="flex-shrink-0" />
              <span>{category}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-gray-500">Not set yet</p>
      )}
    </div>
  );
};
