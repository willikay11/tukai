import { Suspense } from 'react';
import { EventsSkeleton, PillsSkeleton } from '@/app/ui/skeletons';
import Experiences from '@/app/experiences/components/experiences';
import ExperienceFilters from '@/app/experiences/components/experienceFilters';
import InvitedExperiences from '@/app/experiences/components/invitedExperiences';

export default function ExperiencesPage() {
  return (
    <main>
      <div className="col-span-12">
        <Suspense fallback={<PillsSkeleton />}>
          <ExperienceFilters />
        </Suspense>
      </div>
      <div className="grid h-full grid-cols-12 gap-4">
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
        <div className="col-span-12 mx-4 mb-4 md:col-span-10 md:col-start-2 md:mx-0">
          <p className="mb-4 text-xl font-semibold text-gray-700">Discover Experiences</p>
          <Suspense fallback={<EventsSkeleton />}>
            <Experiences />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
