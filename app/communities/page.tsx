import { Suspense } from 'react';
import CommunityFilters from './components/communityFilters';
import { PillsSkeleton } from '../components/skeletons';
import List from './components/list';

export default async function CommunitiesPage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const categoryFromQuery = searchParams?.category;

  return (
    <main className="grid h-full grid-cols-12 gap-4 px-4 md:px-0">
      <div className="col-span-12">
        <Suspense fallback={<PillsSkeleton />}>
          <CommunityFilters category={categoryFromQuery} />
        </Suspense>
      </div>
      <div className="col-span-12 mx-4 mb-4 md:col-span-10 md:col-start-2 md:mx-0">
        <List key={categoryFromQuery} category={categoryFromQuery} />
      </div>
    </main>
  );
}
