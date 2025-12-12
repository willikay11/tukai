import { Suspense } from 'react';
import { PillsSkeleton } from '@/app/components/skeletons';
import moment from 'moment';
import ExperienceFilters from './experiences/components/experienceFilters';
import Experiences from './experiences/components/List/experiences';
import InvitedExperiences from './experiences/components/List/invitedExperiences';

export default function ExperiencesPage({ searchParams }: { searchParams: { category?: string } }) {
  const categoryFromQuery = searchParams?.category;

  return (
    <main className="grid h-full grid-cols-12 gap-x-4 px-4 md:px-0">
      <div className="sticky top-[105px] z-10 col-span-12 bg-white">
        <Suspense fallback={<PillsSkeleton />}>
          <ExperienceFilters category={categoryFromQuery} />
        </Suspense>
      </div>
      <InvitedExperiences skeletonCount={3} isPortal={true} category={categoryFromQuery} />
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
