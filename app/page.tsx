import { EventsSkeleton, PillsSkeleton } from '@/app/components/skeletons';
import { Suspense } from 'react';
import ListPlaces from '@/app/home/components/list';
import PlaceCategoryFilters from '@/app/home/components/PlaceCategoryFilters';

import { fetchPlaceCategories, fetchPlaces } from '@/services/place';

export default async function Home() {
  // Fetch place categories (filters)
  const placeCategories = await fetchPlaceCategories();

  // Default to the first filter (or get it from query params if available)
  const selectedCategoryId = placeCategories?.data?.results?.[0].id;

  // Fetch places based on the selected filter category
  const places = await fetchPlaces(selectedCategoryId);

  console.log('placeCategories: ', placeCategories);
  console.log('selectedCategoryId: ', selectedCategoryId);
  console.log('places: ', places);

  return (
    <main className="grid h-full grid-cols-12 gap-4">
      <div className="col-span-12">
        <Suspense fallback={<PillsSkeleton />}>
          <PlaceCategoryFilters placeCategories={placeCategories.data.results} />
        </Suspense>
      </div>
      <div className="col-span-12 mx-4 mb-4 md:col-span-10 md:col-start-2 md:mx-0">
        <Suspense fallback={<EventsSkeleton />}>
          <ListPlaces places={places?.data?.results} />
        </Suspense>
      </div>
    </main>
  );
}
