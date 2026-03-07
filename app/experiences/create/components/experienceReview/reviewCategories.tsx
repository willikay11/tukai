'use client';

import CategoryPill from '@/components/ui/categoryPill';
import { ExperienceCategory } from '@/types/experienceCategory';

export interface ReviewCategoriesProps {
  categories?: ExperienceCategory[];
}

export default function ReviewCategories({ categories }: ReviewCategoriesProps) {
  if (!categories || categories.length === 0) {
    return null;
  }

  const handleCategoryToggle = () => {};

  return (
    <div className="mt-6">
      <h3 className="text-sm font-semibold text-gray-900">Categories</h3>
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
