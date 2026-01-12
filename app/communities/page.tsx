import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { Session, getServerSession } from 'next-auth';

import List from './components/list';
import AuthGuard from './[communityId]/components/authGuard';

export default async function CommunitiesPage() {
  const session: Session | null = await getServerSession(authOptions as any);

  if (!session) {
    return <AuthGuard />;
  }

  return (
    <main className="grid h-full grid-cols-12 gap-4 px-4 md:px-0">
      <div className="col-span-12 mx-4 mb-4 md:col-span-10 md:col-start-2 md:mx-0">
        <List />
      </div>
    </main>
  );
}
