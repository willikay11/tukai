import { Suspense } from 'react';
import { PillsSkeleton } from '@/app/components/skeletons';
import moment from 'moment';
import ExperienceFilters from './experiences/components/experienceFilters';
import Experiences from './experiences/components/List/experiences';
// import InvitedExperiences from './components/List/invitedExperiences';

export default function ExperiencesPage({ searchParams }: { searchParams: { category?: string } }) {
  const categoryFromQuery = searchParams?.category;

  return (
    <main className="grid h-full grid-cols-12 gap-x-4 px-4 md:px-0">
      <div className="sticky top-[105px] z-10 col-span-12 bg-white">
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
      {/* {(categoryFromQuery === 'all' || categoryFromQuery === undefined) && (
        <Experiences type="invited" skeletonCount={3} />
      )} */}
      <Experiences
        key={categoryFromQuery}
        category={categoryFromQuery}
        title={`Happening Today: ${moment().format('Do MMMM, YYYY')}`}
        date={moment().format('YYYY-MM-DD')}
        isPortal={true}
      />

      <Experiences
        key={categoryFromQuery}
        category={categoryFromQuery}
        title={`Happening Tommorrow: ${moment().add('days', 1).format('Do MMMM, YYYY')}`}
        date={moment().add('days', 1).format('YYYY-MM-DD')}
        isPortal={true}
      />

      <Experiences key={categoryFromQuery} category={categoryFromQuery} title="Discover" />
    </main>
  );
}
