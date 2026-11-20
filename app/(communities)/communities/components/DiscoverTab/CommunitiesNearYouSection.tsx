'use client';

import { CommunityCard } from '@/app/shared/components/Communities/CommunityCard';
import { IconComponent } from '@/app/shared/components/Icons';
import { useShowMore } from '@/app/shared/hooks/useShowMore';
import { cn } from '@/lib/utils';
import { Community } from '@/types/community';

import { COMMUNITY_GRID } from '../grid';

const VISIBLE = 12;

const GridSkeleton = () => (
  <div className={cn('mt-5', COMMUNITY_GRID)} aria-label="Loading communities">
    {Array.from({ length: 4 }).map((_, index) => (
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
 * "Communities near you", as the design has it: the public communities in
 * the reader's city - ones that own a place or host an experience there
 * (`city=`, DEV-434) - that they neither run nor have joined, most members
 * first. "Discover by city" below changes the city.
 */
export const CommunitiesNearYouSection = ({
  city,
  communities,
  isLoading,
}: {
  city: string;
  communities: Community[];
  isLoading: boolean;
}) => {
  const { visible, isExpanded, hasMore, toggle } = useShowMore(communities, VISIBLE);

  return (
    <section aria-label="Communities near you" className="mt-8">
      <h2 className="text-[22px] font-bold tracking-[-0.3px] text-brand-ink">
        Communities near you
      </h2>
      <p className="mt-1 text-sm text-ink-muted">In {city}</p>

      {isLoading ? (
        <GridSkeleton />
      ) : communities.length === 0 ? (
        <p className="mt-4 text-[14.5px] text-ink-subtle">
          No communities in {city} yet. Pick another city below.
        </p>
      ) : (
        <>
          <div className={cn('mt-5', COMMUNITY_GRID)}>
            {visible.map((community) => (
              <CommunityCard key={community.id} community={community} />
            ))}
          </div>

          {hasMore && (
            <button
              type="button"
              onClick={toggle}
              aria-expanded={isExpanded}
              className="mt-3 inline-flex min-h-11 items-center gap-1.5 text-[14.5px] font-semibold text-brand hover:underline"
            >
              {isExpanded ? 'Show less' : 'Show more'}
              <IconComponent
                iconName={isExpanded ? 'ArrowUp01Icon' : 'ArrowDown01Icon'}
                size={16}
                color="currentColor"
              />
            </button>
          )}
        </>
      )}
    </section>
  );
};
