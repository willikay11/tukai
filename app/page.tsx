import { EventsSkeleton, PillsSkeleton } from '@/app/ui/skeletons';
import { Suspense } from 'react';
import ListPlaces from '@/app/home/components/list';
import PlaceCategoryFilters from '@/app/home/components/PlaceCategoryFilters';

export default function Home() {
  return (
    <main className="grid h-full grid-cols-12 gap-4">
      <div className="col-span-12">
        <Suspense fallback={<PillsSkeleton />}>
          <PlaceCategoryFilters />
        </Suspense>
      </div>
      <div className="col-span-12 mx-4 mb-4 md:col-span-10 md:col-start-2 md:mx-0">
        <Suspense fallback={<EventsSkeleton />}>
          <ListPlaces />
        </Suspense>
      </div>
    </main>
  );
}
