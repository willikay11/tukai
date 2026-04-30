'use client';

const CATEGORY_OPTIONS = [
  'Hiking',
  'Running',
  'Camping',
  'Cooking',
  'Backpacking',
  'Walking',
  'Overlooking',
  'Gym',
  'Bird Watching',
  'Sunset',
  'Fishing',
  'Safari',
  'Forts & Museums',
  'Horse Riding',
  'Rock Climbing',
  'Scenic Driving/Road Trip',
  'Restaurants',
  'Sports Activity',
  'Weekend',
  'Shopping',
  'Kids',
  'Water Sports',
  'Night Life',
  'Other',
];

interface CategoryPickerProps {
  selectedCategories: string[];
  onChange: (categories: string[]) => void;
}

export const CategoryPicker = ({ selectedCategories, onChange }: CategoryPickerProps) => {
  const handleToggleCategory = (category: string) => {
    const updated = selectedCategories.includes(category)
      ? selectedCategories.filter((c) => c !== category)
      : [...selectedCategories, category];
    onChange(updated);
  };

  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-gray-800">
        Select a category the experience falls under eg. Hiking, Safari, etc.
      </label>
      <div className="flex flex-wrap gap-2">
        {CATEGORY_OPTIONS.map((category) => {
          const isSelected = selectedCategories.includes(category);
          return (
            <button
              key={category}
              type="button"
              onClick={() => handleToggleCategory(category)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                isSelected
                  ? 'bg-emerald-600 text-white'
                  : 'border border-gray-300 bg-white text-gray-700 hover:border-gray-400'
              }`}
            >
              {category}
            </button>
          );
        })}
      </div>
    </div>
  );
};
