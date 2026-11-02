'use client';

import { ReactNode, useMemo, useState } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { useQueries } from '@tanstack/react-query';

import { CommunityCard } from '@/app/shared/components/Communities/CommunityCard';
import { MomentsMosaicGrid } from '@/app/shared/components/Communities/MomentsMosaicGrid';
import { IconComponent } from '@/app/shared/components/Icons';
import { MomentDrawer } from '@/app/shared/components/Moments';
import { useGetCommunities } from '@/app/shared/hooks/useCommunities';
import { useShowMore } from '@/app/shared/hooks/useShowMore';
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
import { COMMUNITY_GRID } from '../grid';

/**
 * How many followed communities the two feeds below fan out across.
 *
 * Neither `/experiences/` nor `/moments/` can be asked about more than one
 * community at a time - a repeated `community` parameter is last-wins, not an
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
  const heading = (
    <h2 className="text-[22px] font-bold tracking-[-0.3px] text-brand-ink">{title}</h2>
  );

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
  /** Heading over the grid - "Following", "Created or hosted by you". */
  listHeading: string;
  signedOutMessage: string;
  signedOutBlurb: string;
  failureMessage: string;
  /** Cards shown before "Show more" reveals the rest. Omitted shows every
   * card with no Show more at all - the "My communities" tab's own rule. */
  showMoreCount?: number;
  /** The default empty block's title - above `emptyMessage`. */
  emptyTitle?: string;
  emptyMessage?: string;
  /** The default empty block's button, e.g. "Discover communities". */
  emptyAction?: { label: string; onClick: () => void };
  /** Replaces the default empty block entirely - "My communities"'s own richer one. */
  renderEmpty?: () => ReactNode;
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
  failureMessage,
  showMoreCount,
  emptyTitle,
  emptyMessage,
  emptyAction,
  renderEmpty,
  footer,
}: CommunityFeedTabProps) => {
  const router = useRouter();
  const { needAuth } = useAuthDialog();
  const [openMoment, setOpenMoment] = useState<Moment | null>(null);

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

  const { visible, isExpanded, hasMore, toggle } = useShowMore(
    communities,
    showMoreCount ?? communities.length,
  );

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
        <Button onClick={() => needAuth('join')} className="rounded-full px-6">
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
    if (renderEmpty) return <>{renderEmpty()}</>;

    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        {emptyTitle && <h2 className="text-xl font-bold text-gray-900">{emptyTitle}</h2>}
        <NoData message={emptyMessage ?? 'Nothing here yet'} />
        {emptyAction && (
          <Button onClick={emptyAction.onClick} className="rounded-full px-6">
            {emptyAction.label}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-10">
      {(isLoadingExperiences || happening.length > 0) && (
        <section>
          <SectionHeading title="Happening in your communities" />

          <div className="mt-[18px]">
            {isLoadingExperiences ? (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(168px,1fr))] gap-x-4 gap-y-[26px]">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="space-y-3">
                    <div className="aspect-square w-full animate-pulse rounded-2xl bg-gray-100" />
                    <div className="h-3 w-1/3 animate-pulse rounded bg-gray-100" />
                    <div className="h-4 w-2/3 animate-pulse rounded bg-gray-100" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(168px,1fr))] gap-x-4 gap-y-[26px]">
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

        <div className={cn('mt-5', COMMUNITY_GRID)}>
          {visible.map((community) => (
            <CommunityCard key={community.id} community={community} />
          ))}
        </div>

        {hasMore && (
          <Button
            variant="text"
            onClick={toggle}
            className="mt-2 flex items-center gap-1 px-0 font-medium text-primary"
          >
            {isExpanded ? 'Show Less' : 'Show More'}
            <IconComponent
              iconName={isExpanded ? 'ArrowUp01Icon' : 'ArrowDown01Icon'}
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

          <div className="mt-[18px]">
            {isLoadingMoments ? (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-1.5">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="h-[170px] animate-pulse rounded-xl bg-gray-200" />
                ))}
              </div>
            ) : (
              <>
                <MomentsMosaicGrid
                  moments={moments}
                  onSelect={(id) => {
                    const found = moments.find((moment) => moment.id === id);
                    if (found) setOpenMoment(found);
                    else router.push(`/moments?momentId=${id}`);
                  }}
                />
                <MomentDrawer moment={openMoment} onClose={() => setOpenMoment(null)} />
              </>
            )}
          </div>
        </section>
      )}
    </div>
  );
};
