import { PillsSkeleton } from '@/app/components/skeletons';

import { Suspense } from 'react';
import PlaceCategoryFilters from '@/app/place/components/placeCategoryFilters';
import ListPlaces from '@/app/place/components/list';
import { fetchPlaceCategories } from '@/services/place';
import { unstable_cache } from 'next/cache';

const getPlaceCategories = unstable_cache(
  async () => {
    return await fetchPlaceCategories();
  },
  ['placeCategories'],
  { revalidate: 3600, tags: ['placeCategories'] },
);

export default async function Home({ searchParams }: { searchParams: { categoryId?: string } }) {
  const categoryIdFromQuery = searchParams?.categoryId;

  const placeCategories = await getPlaceCategories();
  // Default to the first filter (or get it from query params if available)
  const selectedCategoryId = categoryIdFromQuery || placeCategories?.data?.results?.[0].id;

  return (
    <main className="grid h-full grid-cols-12 gap-4">
      <div className="col-span-12">
        <Suspense fallback={<PillsSkeleton />}>
          <PlaceCategoryFilters
            placeCategories={placeCategories?.data.results}
            selectedCategoryId={selectedCategoryId}
          />
        </Suspense>
      </div>
      <div className="col-span-12 mx-4 mb-4 md:col-span-10 md:col-start-2 md:mx-0">
        <ListPlaces key={selectedCategoryId} selectedCategoryId={selectedCategoryId} />
      </div>
    </main>
  );
}
