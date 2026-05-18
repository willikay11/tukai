'use client';

import { useGetInterestCategories } from '@/app/shared/hooks/useAuth';
import { CategoryPill } from '@/components/ui/categoryPill';
import { Interest } from '@/types/interest';

interface CategoryPickerProps {
  selectedCategories: Interest[];
  onChange: (categories: Interest[]) => void;
}

export const CategoryPicker = ({ selectedCategories, onChange }: CategoryPickerProps) => {
  const { data: categories, isLoading } = useGetInterestCategories();

  const handleToggleCategory = (category: Interest) => {
    const updated = selectedCategories.includes(category)
      ? selectedCategories.filter((c) => c !== category)
      : [...selectedCategories, category];
    onChange(updated);
  };

  if (isLoading) {
    return <div className="text-xs text-gray-500">Loading categories...</div>;
  }

  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-gray-800">
        Select a category the experience falls under
      </label>
      <div className="flex flex-wrap gap-2">
        {categories.map((category: Interest) => (
          <CategoryPill
            key={category.id}
            category={category}
            isSelected={selectedCategories.includes(category)}
            onClick={() => handleToggleCategory(category)}
          />
        ))}
      </div>
    </div>
  );
};
