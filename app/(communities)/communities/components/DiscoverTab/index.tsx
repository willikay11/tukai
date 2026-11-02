'use client';

import { useMemo } from 'react';

import { useSession } from 'next-auth/react';

import { useGetCommunities } from '@/app/shared/hooks/useCommunities';
import { Button } from '@/components/ui/button';
import { NoData } from '@/components/ui/noData';
import { useAuthDialog } from '@/context/AuthDialogContext';
import { useLocation } from '@/context/LocationContext';
import { Community } from '@/types/community';

import { DiscoverByCitySection } from './DiscoverByCitySection';
import { NearYouSection } from './NearYouSection';
import { ViewByTypeSection } from './ViewByTypeSection';

// Wide enough that the near-you/view-by-type sections, both narrowed
// client-side from this one pool, have something left after excluding what
// the reader owns or follows - the API offers no city or "fresh" filter.
const DISCOVER_POOL_SIZE = 60;

const GridSkeleton = () => (
  <div className="mt-5 grid grid-cols-1 gap-x-5 gap-y-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
    {Array.from({ length: 8 }).map((_, index) => (
      <div key={index} className="flex items-start gap-2.5">
        <div className="h-[62px] w-[62px] flex-shrink-0 animate-pulse rounded-xl bg-gray-100" />
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-3.5 w-2/3 animate-pulse rounded bg-gray-100" />
          <div className="h-3 w-1/3 animate-pulse rounded bg-gray-100" />
        </div>
      </div>
    ))}
  </div>
);

/**
 * The Communities page's Discover tab: near-you, view-by-type and
 * discover-by-city, all narrowed client-side from one shared pool of public
 * communities (not the reader's own, not already followed) - the list
 * endpoint has no city, "fresh" or friends filter to ask for instead.
 *
 * "Your friends joined" is left out entirely: there is no connections/social
 * graph anywhere in this codebase to build it from - see COMMUNITY_HANDOFF
 * gap notes.
 */
export const DiscoverTab = ({ isSignedIn }: { isSignedIn: boolean }) => {
  const { data: session } = useSession();
  const userId = session?.user?.id ?? undefined;
  const { needAuth } = useAuthDialog();
  const { city } = useLocation();

  const { data, isLoading, isFetching, refetch } = useGetCommunities({
    page: 1,
    pageSize: DISCOVER_POOL_SIZE,
    enabled: true,
  });

  const { data: followingData } = useGetCommunities({
    page: 1,
    pageSize: DISCOVER_POOL_SIZE,
    following: true,
    enabled: isSignedIn,
  });

  const { data: ownedData } = useGetCommunities({
    page: 1,
    pageSize: DISCOVER_POOL_SIZE,
    createdBy: userId,
    enabled: isSignedIn && Boolean(userId),
  });

  const hasFailed = data?.success === false;
  const pool: Community[] = useMemo(() => data?.data?.results ?? [], [data]);

  const excludedIds = useMemo(() => {
    const ids = new Set<string>();
    (followingData?.data?.results ?? []).forEach((community: Community) => ids.add(community.id));
    (ownedData?.data?.results ?? []).forEach((community: Community) => ids.add(community.id));
    return ids;
  }, [followingData, ownedData]);

  const fresh = useMemo(
    () => pool.filter((community) => community.isPublic && !excludedIds.has(community.id)),
    [pool, excludedIds],
  );

  const nearYou = useMemo(
    () =>
      (city ? fresh.filter((community) => community.location?.city === city) : fresh)
        .slice()
        .sort((a, b) => (b.membersCount ?? 0) - (a.membersCount ?? 0)),
    [fresh, city],
  );

  return (
    <>
      {isLoading ? (
        <GridSkeleton />
      ) : hasFailed ? (
        <div className="mt-8 flex flex-col items-center gap-4 py-16">
          <NoData message="Communities could not load" />
          <p className="max-w-sm text-center text-sm text-gray-400">
            {data?.message || 'Something went wrong. Please try again.'}
          </p>
          <Button onClick={() => refetch()} isLoading={isFetching} className="rounded-full px-6">
            Try again
          </Button>
        </div>
      ) : (
        <>
          <NearYouSection city={city} communities={nearYou} />
          <ViewByTypeSection communities={fresh} />
        </>
      )}

      <DiscoverByCitySection />

      {!isSignedIn && (
        <div className="mt-10 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-gray-50 px-4 py-3">
          <p className="text-sm text-gray-600">Sign in to follow communities and join in</p>
          <Button onClick={() => needAuth('join')} className="flex-shrink-0 rounded-full px-6">
            Sign in
          </Button>
        </div>
      )}
    </>
  );
};
