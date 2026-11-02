'use client';

import { CommunityCard } from '@/app/shared/components/Communities/CommunityCard';
import { IconComponent } from '@/app/shared/components/Icons';
import { useShowMore } from '@/app/shared/hooks/useShowMore';
import { cn } from '@/lib/utils';
import { Community } from '@/types/community';

import { COMMUNITY_GRID } from '../grid';

const VISIBLE = 12;

/**
 * "All communities": every public community the reader neither owns nor has
 * joined, wherever it is, most members first.
 */
export const AllCommunitiesSection = ({ communities }: { communities: Community[] }) => {
  const { visible, isExpanded, hasMore, toggle } = useShowMore(communities, VISIBLE);

  return (
    <section className="mt-8">
      <h2 className="text-[22px] font-bold tracking-[-0.3px] text-brand-ink">
        All communities
      </h2>

      {communities.length === 0 ? (
        <p className="mt-4 text-[14.5px] text-ink-subtle">
          No communities to discover yet.
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
