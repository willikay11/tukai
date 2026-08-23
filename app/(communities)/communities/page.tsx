import { Session } from 'next-auth';
import type { Metadata } from 'next';

import { getAuthSession } from '@/lib/auth';

import { AuthGuard } from './[communityId]/components/authGuard';
import { CommunitiesPageContent } from './components/CommunitiesPageContent';

export const metadata: Metadata = {
  title: 'Tukai - Communities',
  description: 'The crews that make every adventure better',
};

export default async function CommunitiesPage() {
  const session: Session | null = await getAuthSession();

  // Both views are the signed-in user's own — their memberships and the
  // suggestions built from them
  if (!session) {
    return <AuthGuard />;
  }

  return <CommunitiesPageContent />;
}
