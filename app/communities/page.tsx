import { Session } from 'next-auth';

import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getAuthSession } from '@/lib/auth';

import AuthGuard from './[communityId]/components/authGuard';
import List from './components/list';

export default async function CommunitiesPage() {
  const session: Session | null = await getAuthSession();

  if (!session) {
    return <AuthGuard />;
  }

  return (
    <main className="grid h-full grid-cols-12 gap-4 px-4 md:px-0">
      <div className="col-span-12 mb-4 md:col-span-10 md:col-start-2 md:mx-0 lg:col-span-10 lg:col-start-2 xl:col-span-10 xl:col-start-2 3xl:col-span-8 3xl:col-start-3 4xl:col-span-6 4xl:col-start-4">
        <List />
      </div>
    </main>
  );
}
