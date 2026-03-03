'use client';

import { ExperienceCategory } from '@/types/experienceCategory';

export interface ReviewCategoriesProps {
  categories?: ExperienceCategory[];
}

export default function ReviewCategories({ categories }: ReviewCategoriesProps) {
  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <div className="mt-6">
      <h3 className="text-sm font-semibold text-gray-900">Categories</h3>
      <div className="mt-2 flex flex-wrap gap-2">
        {categories.map((category) => (
          <span
            key={category.id}
            className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs text-gray-700"
          >
            {category.name}
          </span>
        ))}
      </div>
    </div>
  );
}
