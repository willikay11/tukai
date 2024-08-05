import SubTopBar from '@/app/ui/subTopBar';
import SubTopBarFilters from '@/app/ui/subTopBarFilters';
import { EventsSkeleton } from '@/app/ui/skeletons';
import { Suspense } from 'react';
import Experiences from '@/app/ui/experiences';

export default function Home() {
  return (
    <main className="grid h-full grid-cols-12 gap-4">
      <div className="col-span-12">
        <SubTopBar />
        <SubTopBarFilters />
      </div>
      <div className="col-span-12 mx-4 mb-4 md:col-span-10 md:col-start-2 md:mx-0">
        <Suspense fallback={<EventsSkeleton />}>
          <Experiences />
        </Suspense>
      </div>
    </main>
  );
}
