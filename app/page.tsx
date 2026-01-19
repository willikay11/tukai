import moment from 'moment';

import Experiences from './experiences/components/List/experiences';
import InvitedExperiences from './experiences/components/List/invitedExperiences';

export default function ExperiencesPage({ searchParams }: { searchParams: { category?: string } }) {
  const categoryFromQuery = searchParams?.category;

  return (
    <main className="grid h-full grid-cols-12 gap-x-4 px-4 md:px-0">
      <InvitedExperiences skeletonCount={3} isPortal={true} category={categoryFromQuery} />

      {(categoryFromQuery === 'all' || categoryFromQuery === undefined) && (
        <>
          <Experiences
            key={categoryFromQuery}
            category={categoryFromQuery}
            title={`Happening Today: ${moment().format('Do MMMM, YYYY')}`}
            date={moment().format('YYYY-MM-DD')}
            isPortal={true}
            isBookedmarked={false}
            isReserved={false}
            isHosted={false}
          />

          <Experiences
            key={categoryFromQuery}
            category={categoryFromQuery}
            title={`Happening Tomorrow: ${moment().add(1, 'days').format('Do MMMM, YYYY')}`}
            date={moment().add(1, 'days').format('YYYY-MM-DD')}
            isPortal={true}
            isBookedmarked={false}
            isReserved={false}
            isHosted={false}
          />

          <Experiences
            key={categoryFromQuery}
            category={categoryFromQuery}
            title="Discover"
            isPortal={false}
            isBookedmarked={false}
            isReserved={false}
            isHosted={false}
          />
        </>
      )}

      {categoryFromQuery === 'saved' && (
        <Experiences
          key={categoryFromQuery}
          category={categoryFromQuery}
          isPortal={false}
          isBookedmarked={true}
          isReserved={false}
          isHosted={false}
          noDataMessage="You have no bookmarked experiences"
        />
      )}

      {categoryFromQuery === 'hosting' && (
        <Experiences
          key={categoryFromQuery}
          category={categoryFromQuery}
          isPortal={false}
          isBookedmarked={false}
          isReserved={false}
          isHosted={true}
          noDataMessage="You are not hosting any experiences"
        />
      )}

      {categoryFromQuery === 'reserved' && (
        <Experiences
          key={categoryFromQuery}
          category={categoryFromQuery}
          isPortal={false}
          isBookedmarked={false}
          isReserved={true}
          isHosted={false}
          noDataMessage="You have no reserved experiences"
        />
      )}
    </main>
  );
}
