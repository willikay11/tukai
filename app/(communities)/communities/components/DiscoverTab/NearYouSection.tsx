'use client';

import { CommunityCard } from '@/app/shared/components/Communities/CommunityCard';
import { IconComponent } from '@/app/shared/components/Icons';
import { useShowMore } from '@/app/shared/hooks/useShowMore';
import { Community } from '@/types/community';

const VISIBLE = 12;

/**
 * "Communities near you": public communities in the current city that the
 * reader neither owns nor has joined, most members first.
 */
export const NearYouSection = ({ city, communities }: { city?: string; communities: Community[] }) => {
  const { visible, isExpanded, hasMore, toggle } = useShowMore(communities, VISIBLE);

  return (
    <section className="mt-8">
      <h2 className="text-[22px] font-bold tracking-[-0.3px] text-brand-ink">
        Communities near you
      </h2>
      {city && <p className="mt-[5px] text-[13.5px] text-ink-muted">In {city}</p>}

      {communities.length === 0 ? (
        <p className="mt-4 text-[14.5px] text-ink-subtle">
          No communities in {city ?? 'your city'} yet. Pick another city below.
        </p>
      ) : (
        <>
          <div className="mt-5 grid grid-cols-1 gap-x-5 gap-y-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visible.map((community) => (
              <CommunityCard key={community.id} community={community} showMeta={false} />
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
