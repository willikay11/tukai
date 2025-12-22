import moment from 'moment';
import Experiences from './experiences/components/List/experiences';
import InvitedExperiences from './experiences/components/List/invitedExperiences';

export default function ExperiencesPage({ searchParams }: { searchParams: { category?: string } }) {
  const categoryFromQuery = searchParams?.category;

  return (
    <main className="grid h-full grid-cols-12 gap-x-4 px-4 md:px-0">
      <InvitedExperiences skeletonCount={3} isPortal={true} category={categoryFromQuery} />

      <Experiences
        key={categoryFromQuery}
        category={categoryFromQuery}
        title={`Happening Today: ${moment().format('Do MMMM, YYYY')}`}
        date={moment().format('YYYY-MM-DD')}
        isPortal={true}
        isBookedmarked={categoryFromQuery === 'saved'}
        isReserved={categoryFromQuery === 'reserved'}
        isHosted={categoryFromQuery === 'hosting'}
      />

      <Experiences
        key={categoryFromQuery}
        category={categoryFromQuery}
        title={`Happening Tommorrow: ${moment().add(1, 'days').format('Do MMMM, YYYY')}`}
        date={moment().add(1, 'days').format('YYYY-MM-DD')}
        isPortal={true}
        isBookedmarked={categoryFromQuery === 'saved'}
        isReserved={categoryFromQuery === 'reserved'}
        isHosted={categoryFromQuery === 'hosting'}
      />

      <Experiences
        key={categoryFromQuery}
        category={categoryFromQuery}
        title="Discover"
        isPortal={false}
        isBookedmarked={categoryFromQuery === 'saved'}
        isReserved={categoryFromQuery === 'reserved'}
        isHosted={categoryFromQuery === 'hosting'}
      />
    </main>
  );
}
