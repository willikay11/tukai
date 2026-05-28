'use client';

import { CategoryPicker } from '../../CategoryPicker';
import { Interest } from '@/types/interest';

interface EditCategoriesFieldProps {
  value: Interest[];
  onChange: (categories: Interest[]) => void;
  error?: string;
}

export const EditCategoriesField = ({
  value,
  onChange,
  error,
}: EditCategoriesFieldProps) => {
  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-gray-800">Categories</label>
      <CategoryPicker
        selectedCategories={value}
        onChange={(newCategories) => {
          onChange(newCategories);
        }}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};
