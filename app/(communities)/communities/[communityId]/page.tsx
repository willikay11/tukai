import type { Metadata } from 'next';
import { Session } from 'next-auth';
import { notFound } from 'next/navigation';

import { getAuthSession } from '@/lib/auth';
import { fetchCommunity } from '@/services/community';
import { ApiResponse } from '@/types/apiResponse';
import { Community } from '@/types/community';
import { communityPath } from '@/utils/detail-paths';
import { APP_ORIGIN, buildShareMetadata } from '@/utils/share-metadata';

import { CommunityDetailContent } from './components/CommunityDetailContent';

export async function generateMetadata({
  params,
}: {
  params: { communityId: string };
}): Promise<Metadata> {
  try {
    const response: ApiResponse = await fetchCommunity(params.communityId);
    const community: Community | undefined = response.data;

    if (!community) return { title: 'Tukai' };

    return buildShareMetadata({
      name: community.title,
      description: community.description?.replace(/<[^>]*>/g, '').slice(0, 200),
      url: `${APP_ORIGIN}${communityPath(community)}`,
    });
  } catch {
    return { title: 'Tukai' };
  }
}

export default async function ViewCommunityPage({ params }: { params: { communityId: string } }) {
  // No auth gate. A community is public to read - the actions inside it ask
  // for a sign-in where they are pressed, rather than at the door.
  const session: Session | null = await getAuthSession();

  const communityResponse: ApiResponse = await fetchCommunity(params.communityId);
  const community: Community | undefined = communityResponse.data;

  // Previously this returned undefined, which renders a blank page rather than
  // the not-found route
  if (!community) {
    notFound();
  }

  return <CommunityDetailContent community={community} currentUserId={session?.user?.id ?? ''} />;
}
