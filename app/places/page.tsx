import { PillsSkeleton } from '@/app/components/skeletons';
import { Suspense } from 'react';
import { fetchPlaceCategories } from '@/services/place';
import { unstable_cache } from 'next/cache';
import { PlaceCategory } from '@/types/placeCategory';
import ListPlaces from './components/list';
import PlaceCategoryFilters from './components/placeCategoryFilters';

const getPlaceCategories = unstable_cache(
  async () => {
    return await fetchPlaceCategories();
  },
  ['placeCategories'],
  { revalidate: 3600, tags: ['placeCategories'] },
);

export default async function Home({ searchParams }: { searchParams: { category?: string } }) {
  const categoryFromQuery = searchParams?.category;

  const placeCategories = await getPlaceCategories();

  // Default to the first filter (or get it from query params if available)
  const selectedCategoryId =
    categoryFromQuery ||
    placeCategories?.data?.results?.sort(
      (a: PlaceCategory, b: PlaceCategory) => b.placesCount - a.placesCount,
    )?.[0].id;

  return (
    <main className="grid h-full grid-cols-12 gap-4 px-4 md:px-0">
      <div className="sticky top-[81px] z-20 col-span-12 md:top-[105px]">
        <Suspense fallback={<PillsSkeleton />}>
          <PlaceCategoryFilters
            placeCategories={placeCategories?.data?.results}
            selectedCategoryId={selectedCategoryId}
          />
        </Suspense>
      </div>
      <div className="col-span-12 mb-4 md:col-span-10 md:col-start-2 md:mx-0">
        <ListPlaces key={selectedCategoryId} selectedCategoryId={selectedCategoryId} />
      </div>
    </main>
  );
}
