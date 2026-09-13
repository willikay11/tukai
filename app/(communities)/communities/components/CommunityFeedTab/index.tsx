'use client';

import { ReactNode, useMemo, useState } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { useQueries } from '@tanstack/react-query';

import { CommunityDiscoverCard } from '@/app/(experiences)/components/CommunityDiscoverCard';
import { IconComponent } from '@/app/shared/components/Icons';
import { MomentsMasonry } from '@/app/shared/components/Moments';
import { useGetCommunities } from '@/app/shared/hooks/useCommunities';
import { Button } from '@/components/ui/button';
import { NoData } from '@/components/ui/noData';
import { useAuthDialog } from '@/context/AuthDialogContext';
import { cn } from '@/lib/utils';
import { fetchExperiences } from '@/services/experience';
import { fetchMoments } from '@/services/moments';
import { Community } from '@/types/community';
import { Experience } from '@/types/experience';
import { Moment, momentPhotos } from '@/types/moment';

import { CommunityHappeningCard } from '../CommunityHappeningCard';
import { COMMUNITY_GRID, COMMUNITY_GRID_COLLAPSED } from '../grid';

/**
 * How many followed communities the two feeds below fan out across.
 *
 * Neither `/experiences/` nor `/moments/` can be asked about more than one
 * community at a time — a repeated `community` parameter is last-wins, not an
 * OR, and a comma-joined one is a 400. So "what is happening across everything
 * I follow" costs one request per community, and the cap is what keeps a
 * reader who follows thirty of them from opening thirty connections.
 *
 * The communities come back ordered by the API, so this is its idea of the
 * most relevant ones rather than an arbitrary slice.
 */
const FEED_FANOUT = 6;

const SectionHeading = ({
  title,
  href,
}: {
  title: string;
  /** Renders the chevron. Omitted where there is nowhere to go. */
  href?: string;
}) => {
  const heading = <h2 className="text-xl font-bold text-gray-900">{title}</h2>;

  if (!href) return heading;

  return (
    <Link href={href} className="flex w-fit items-center gap-1 text-gray-900 hover:text-primary">
      {heading}
      <IconComponent iconName="ArrowRight01Icon" size={20} color="currentColor" />
    </Link>
  );
};

export interface CommunityFeedTabProps {
  isSignedIn: boolean;
  /** Which slice of the reader's communities this tab is: their follows, or the ones they run. */
  query: { following?: boolean; createdBy?: string };
  /** Heading over the grid — "Following", "Created or Hosted by You". */
  listHeading: string;
  signedOutMessage: string;
  signedOutBlurb: string;
  emptyMessage: string;
  failureMessage: string;
  /** Rendered under the grid: the create CTA on the reader's own tab. */
  footer?: ReactNode;
}

/**
 * The shape both signed-in community tabs take: what is coming up across them,
 * the communities themselves, and the moments posted in them.
 *
 * Following and My Communities differ only in which communities they are about
 * and what they call them, so they share this rather than being two copies
 * that drift.
 */
export const CommunityFeedTab = ({
  isSignedIn,
  query,
  listHeading,
  signedOutMessage,
  signedOutBlurb,
  emptyMessage,
  failureMessage,
  footer,
}: CommunityFeedTabProps) => {
  const router = useRouter();
  const { openSignInWithCallback } = useAuthDialog();
  const [showAllRows, setShowAllRows] = useState(false);

  // Both slices are the reader's own, so neither tab means anything signed out
  const { data, isLoading, isFetching, refetch } = useGetCommunities({
    page: 1,
    enabled: isSignedIn,
    ...query,
  });

  // The service resolves with `success: false` instead of throwing, so a failed
  // request reaches here looking like an empty one
  const hasFailed = data?.success === false;
  const communities: Community[] = data?.data?.results ?? [];
  const fanOutIds = communities.slice(0, FEED_FANOUT).map((community) => community.id);

  const experienceQueries = useQueries({
    queries: fanOutIds.map((communityId) => ({
      queryKey: ['experiences', 'community', communityId],
      queryFn: () => fetchExperiences({ community: communityId, page: 1, page_size: 6 }),
      enabled: isSignedIn,
    })),
  });

  const momentQueries = useQueries({
    queries: fanOutIds.map((communityId) => ({
      queryKey: ['moments', 'community', communityId],
      queryFn: () => fetchMoments({ community: communityId, page_size: 12 }),
      enabled: isSignedIn,
    })),
  });

  const isLoadingExperiences = experienceQueries.some((query) => query.isLoading);
  const isLoadingMoments = momentQueries.some((query) => query.isLoading);

  // Soonest first across every community, so the section reads as a calendar
  // rather than as one community's list followed by another's
  const happening: Experience[] = useMemo(
    () =>
      experienceQueries
        .flatMap((query) => (query.data?.data?.results ?? []) as Experience[])
        .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
        .slice(0, 6),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [experienceQueries.map((query) => query.dataUpdatedAt).join()],
  );

  const moments: Moment[] = useMemo(
    () =>
      momentQueries
        .flatMap((query) => (query.data?.data?.results ?? []) as Moment[])
        .filter((moment) => momentPhotos(moment).length > 0),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [momentQueries.map((query) => query.dataUpdatedAt).join()],
  );

  if (!isSignedIn) {
    return (
      <div className="flex flex-col items-center gap-4 py-16">
        <NoData message={signedOutMessage} />
        <p className="max-w-sm text-center text-sm text-gray-400">{signedOutBlurb}</p>
        {/* Nothing to carry through: the tab is already open, and it fills in
            as soon as the session lands */}
        <Button
          onClick={() => openSignInWithCallback(() => undefined)}
          className="rounded-full px-6"
        >
          Sign in
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={cn('mt-8', COMMUNITY_GRID)}>
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="space-y-3">
            <div className="h-[180px] w-full animate-pulse rounded-2xl bg-gray-100" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-gray-100" />
            <div className="h-3 w-full animate-pulse rounded bg-gray-100" />
          </div>
        ))}
      </div>
    );
  }

  if (hasFailed) {
    return (
      <div className="flex flex-col items-center gap-4 py-16">
        <NoData message={failureMessage} />
        <p className="max-w-sm text-center text-sm text-gray-400">
          {data?.message || 'Something went wrong. Please try again.'}
        </p>
        <Button onClick={() => refetch()} isLoading={isFetching} className="rounded-full px-6">
          Try again
        </Button>
      </div>
    );
  }

  if (communities.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-16">
        <NoData message={emptyMessage} />
      </div>
    );
  }

  const visibleCards = showAllRows ? communities : communities.slice(0, COMMUNITY_GRID_COLLAPSED);

  return (
    <div className="mt-8 space-y-10">
      {(isLoadingExperiences || happening.length > 0) && (
        <section>
          <SectionHeading title="Happening in your Communities" />

          <div className="mt-4">
            {isLoadingExperiences ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="space-y-3">
                    <div className="aspect-square w-full animate-pulse rounded-2xl bg-gray-100" />
                    <div className="h-3 w-1/3 animate-pulse rounded bg-gray-100" />
                    <div className="h-4 w-2/3 animate-pulse rounded bg-gray-100" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {happening.map((experience, index) => (
                  <CommunityHappeningCard
                    key={experience.id}
                    experience={experience}
                    priority={index < 4}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      <section className="border-t border-gray-100 pt-8">
        <SectionHeading title={listHeading} />

        <div className={cn('mt-4', COMMUNITY_GRID)}>
          {visibleCards.map((community, index) => (
            <CommunityDiscoverCard
              key={community.id}
              community={community}
              // The card is sized for the Discover scroll row by default
              className="w-full"
              showMemberAvatars
              priority={index < 4}
            />
          ))}
        </div>

        {communities.length > COMMUNITY_GRID_COLLAPSED && (
          <Button
            variant="text"
            onClick={() => setShowAllRows((previous) => !previous)}
            className="mt-2 flex items-center gap-1 px-0 font-medium text-primary"
          >
            {showAllRows ? 'Show Less' : 'Show More'}
            <IconComponent
              iconName={showAllRows ? 'ArrowUp01Icon' : 'ArrowDown01Icon'}
              size={18}
              color="currentColor"
            />
          </Button>
        )}

        {footer}
      </section>

      {(isLoadingMoments || moments.length > 0) && (
        <section className="border-t border-gray-100 pt-8">
          <SectionHeading title="Moments" href="/moments" />

          <div className="mt-4">
            {isLoadingMoments ? (
              <div className="columns-3 gap-3 md:columns-4 xl:columns-5">
                {[220, 300, 180, 260, 200, 320].map((height, index) => (
                  <div
                    key={index}
                    style={{ height }}
                    className="mb-4 w-full animate-pulse break-inside-avoid rounded-2xl bg-gray-200"
                  />
                ))}
              </div>
            ) : (
              <MomentsMasonry
                moments={moments}
                selectedId={null}
                // The masonry opens a pane on the moments page; here a tile is
                // a link into it, deep-linked to the one that was pressed
                onSelect={(id) => router.push(`/moments?momentId=${id}`)}
                // Paging belongs to the moments page. This is a glimpse of what
                // the reader's communities have posted, not the whole feed.
                onLoadMore={() => undefined}
                hasMore={false}
                isLoadingMore={false}
                // Denser than the moments page, which gives the masonry half a
                // screen beside a detail pane. Here it has the full width, and
                // the default three columns made each tile enormous.
                columnsClassName="columns-3 gap-3 md:columns-4 xl:columns-5"
              />
            )}
          </div>
        </section>
      )}
    </div>
  );
};
