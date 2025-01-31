import PlaceCategoriesScrollFilters from '@/app/home/components/PlaceCategoryFilters/filters';
import { fetchPlaceCategories } from '@/app/lib/data';

export default async function PlaceCategoryFilters() {
  const placeCategories = await fetchPlaceCategories();
  return (
    <div className="w-full border-b-[1px] border-gray-100 bg-white">
      <div className="grid grid-cols-12 gap-4">
        <div className="relative col-span-12 mx-4 md:col-span-10 md:col-start-2 md:mx-0">
          <PlaceCategoriesScrollFilters placesCategories={placeCategories.data.results} />
        </div>
      </div>
    </div>
  );
}
