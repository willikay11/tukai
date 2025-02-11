import { PillsSkeleton } from '@/app/components/skeletons';

import { Suspense } from 'react';
import PlaceCategoryFilters from '@/app/home/components/PlaceCategoryFilters';
import ListPlaces from '@/app/home/components/list';

export default function Home({ searchParams }: { searchParams: { categoryId?: string } }) {
  const selectedCategoryId = searchParams?.categoryId;

  // // Default to the first filter (or get it from query params if available)
  // const selectedCategoryId = categoryIdFromQuery || placeCategories?.data?.results?.[0].id;

  return (
    <main className="grid h-full grid-cols-12 gap-4">
      <div className="col-span-12">
        <Suspense fallback={<PillsSkeleton />}>
          <PlaceCategoryFilters selectedCategoryId={selectedCategoryId} />
        </Suspense>
      </div>
      <div className="col-span-12 mx-4 mb-4 md:col-span-10 md:col-start-2 md:mx-0">
        <ListPlaces key={selectedCategoryId} selectedCategoryId={selectedCategoryId} />
      </div>
    </main>
  );
}
