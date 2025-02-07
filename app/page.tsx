import { EventsSkeleton, PillsSkeleton } from '@/app/components/skeletons';

import { fetchPlaceCategories, fetchPlaces } from '@/services/place';
import dynamic from 'next/dynamic';

// Dynamically import components with skeleton fallback
const PlaceCategoryFilters = dynamic(() => import('@/app/home/components/PlaceCategoryFilters'), {
  ssr: false,
  loading: () => <PillsSkeleton />,
});

const ListPlaces = dynamic(() => import('@/app/home/components/list'), {
  ssr: false,
  loading: () => <EventsSkeleton />,
});
export default async function Home({ searchParams }: { searchParams: { categoryId?: string } }) {
  const categoryIdFromQuery = searchParams?.categoryId;

  // Fetch place categories (filters)
  const placeCategories = await fetchPlaceCategories();

  // Default to the first filter (or get it from query params if available)
  const selectedCategoryId = categoryIdFromQuery || placeCategories?.data?.results?.[0].id;

  // Fetch places based on the selected filter category
  const places = await fetchPlaces(selectedCategoryId);

  return (
    <main className="grid h-full grid-cols-12 gap-4">
      <div className="col-span-12">
        <PlaceCategoryFilters
          placeCategories={placeCategories.data.results}
          selectedCategoryId={selectedCategoryId}
        />
      </div>
      <div className="col-span-12 mx-4 mb-4 md:col-span-10 md:col-start-2 md:mx-0">
        <ListPlaces initialPlaces={places?.data?.results} selectedCategoryId={selectedCategoryId} />
      </div>
    </main>
  );
}
