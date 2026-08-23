import type { Metadata } from 'next';
import { Session } from 'next-auth';
import { notFound } from 'next/navigation';

import { getAuthSession } from '@/lib/auth';
import { fetchCommunity } from '@/services/community';
import { ApiResponse } from '@/types/apiResponse';
import { Community } from '@/types/community';

import { CommunityDetailContent } from './components/CommunityDetailContent';
import { AuthGuard } from './components/authGuard';

export async function generateMetadata({
  params,
}: {
  params: { communityId: string };
}): Promise<Metadata> {
  try {
    const response: ApiResponse = await fetchCommunity(params.communityId);
    const community: Community | undefined = response.data;

    return community ? { title: `Tukai - ${community.title}` } : { title: 'Tukai' };
  } catch {
    return { title: 'Tukai' };
  }
}

export default async function ViewCommunityPage({ params }: { params: { communityId: string } }) {
  const session: Session | null = await getAuthSession();

  if (!session) {
    return <AuthGuard />;
  }

  const communityResponse: ApiResponse = await fetchCommunity(params.communityId);
  const community: Community | undefined = communityResponse.data;

  // Previously this returned undefined, which renders a blank page rather than
  // the not-found route
  if (!community) {
    notFound();
  }

  return <CommunityDetailContent community={community} currentUserId={session.user?.id ?? ''} />;
}
