import { Suspense } from 'react';
import { PillsSkeleton } from '@/app/components/skeletons';
import Experiences from './components/experiences';
import ExperienceFilters from './components/experienceFilters';

export default function ExperiencesPage({ searchParams }: { searchParams: { category?: string } }) {
  const categoryFromQuery = searchParams?.category;

  return (
    <main className="grid h-full grid-cols-12 gap-4 px-4 md:px-0">
      <div className="col-span-12">
        <Suspense fallback={<PillsSkeleton />}>
          <ExperienceFilters category={categoryFromQuery} />
        </Suspense>
      </div>
      {/* <div className="grid h-full grid-cols-12 gap-4">
        <div className="col-span-12 bg-gray-100">
          <div className="grid grid-cols-12 py-4">
            <div className="mx-4 mb-4 md:col-span-10 md:col-start-2 md:mx-0">
              <div className="mb-4 inline-flex items-center">
                <span className="text-xl font-semibold text-gray-700">Invited Experiences</span>
                <div className="mx-2 h-[2px] w-[2px] rounded-full bg-gray-400" />
                <span className="text-xl font-normal text-gray-500">3</span>
              </div>
              <Suspense fallback={<EventsSkeleton />}>
                <InvitedExperiences />
              </Suspense>
            </div>
          </div>
        </div>
      </div> */}
      <div className="col-span-12 mx-4 mb-4 md:col-span-10 md:col-start-2 md:mx-0">
          <p className="mb-4 mt-2.5 text-xl font-semibold text-gray-700">Discover Experiences</p>
          <Experiences key={categoryFromQuery} category={categoryFromQuery} />
        </div>
    </main>
  );
}