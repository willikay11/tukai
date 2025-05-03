'use client';
import ScrollFilters from '@/app/components/scrollFilters';
import { PlaceCategory } from '@/types/placeCategory';

type placeCategoryFilterProps = {
  selectedCategoryId?: string;
  placeCategories: PlaceCategory[];
};
export default function PlaceCategoryFilters({
  selectedCategoryId,
  placeCategories,
}: placeCategoryFilterProps) {
  return (
    <div className="w-full border-b-[1px] border-gray-100 bg-white">
      <div className="grid grid-cols-12 gap-4">
        <div className="relative col-span-12 mx-4 md:col-span-10 md:col-start-2 md:mx-0">
          <ScrollFilters
            filters={placeCategories
              ?.sort((a, b) => b.placesCount - a.placesCount)
              ?.filter((placeCategory: PlaceCategory) => placeCategory.group !== 'cities')
              ?.map((placeCategory: PlaceCategory) => ({
                label: placeCategory.name,
                value: placeCategory.id,
                icon: placeCategory.icon,
              }))}
            selectedCategory={selectedCategoryId}
          />
        </div>
      </div>
    </div>
  );
}
