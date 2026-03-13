'use client';

import IconComponent from '@/app/components/iconComponent';
import CategoryPill from '@/components/ui/categoryPill';
import { ExperienceCategory } from '@/types/experienceCategory';

export interface ReviewCategoriesProps {
  categories?: ExperienceCategory[];
  editable?: boolean;
  onEdit?: () => void;
}

export default function ReviewCategories({
  categories,
  editable = false,
  onEdit,
}: ReviewCategoriesProps) {
  if (!categories || categories.length === 0) {
    return null;
  }

  const handleCategoryToggle = () => {};

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-base font-semibold text-gray-700">Categories</h3>
        <button
          type="button"
          onClick={onEdit}
          disabled={editable === false}
          className="text-gray-400 transition-colors hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Edit Categories"
        >
          <IconComponent iconName="Edit02Icon" size={16} className="text-primary" />
        </button>
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {categories.map((category) => (
          <CategoryPill
            key={category.id}
            category={category}
            onClick={handleCategoryToggle}
            isSelected={false}
          />
        ))}
      </div>
    </div>
  );
}
