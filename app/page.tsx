import SubTopBarFilters from '@/app/ui/subTopBarFilters';
import { EventsSkeleton } from '@/app/ui/skeletons';
import { Suspense } from 'react';
import ListPlaces from '@/app/home/components/list';

export default function Home() {
  return (
    <main className="grid h-full grid-cols-12 gap-4">
      <div className="col-span-12">
        <SubTopBarFilters />
      </div>
      <div className="col-span-12 mx-4 mb-4 md:col-span-10 md:col-start-2 md:mx-0">
        <Suspense fallback={<EventsSkeleton />}>
          <ListPlaces />
        </Suspense>
      </div>
    </main>
  );
}
