import { Suspense } from 'react';
import { EventsSkeleton } from '@/app/ui/skeletons';
import Experiences from '@/app/experiences/components/experiences';

export default function ExperiencesPage() {
  return (
    <main className="grid h-full grid-cols-12 gap-4">
      <div className="col-span-12 mx-4 mb-4 md:col-span-10 md:col-start-2 md:mx-0">
        <Suspense fallback={<EventsSkeleton />}>
          <Experiences />
        </Suspense>
      </div>
    </main>
  );
}
