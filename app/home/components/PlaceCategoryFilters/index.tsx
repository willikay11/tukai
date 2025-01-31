import { fetchPlaceCategories } from '@/app/lib/data';
import ScrollFilters from '@/app/ui/scrollFilters';
import { PlaceCategory } from '@/app/lib/definitions';

export default async function PlaceCategoryFilters() {
  const placeCategories = await fetchPlaceCategories();

  return (
    <div className="w-full border-b-[1px] border-gray-100 bg-white">
      <div className="grid grid-cols-12 gap-4">
        <div className="relative col-span-12 mx-4 md:col-span-10 md:col-start-2 md:mx-0">
          <ScrollFilters
            filters={placeCategories.data.results.map((placeCategory: PlaceCategory) => ({
              label: placeCategory.name,
              value: placeCategory.id,
              icon: placeCategory.icon,
            }))}
          />
        </div>
      </div>
    </div>
  );
}
