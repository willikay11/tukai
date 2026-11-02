'use client';

import { useMemo, useState } from 'react';

import { CommunityCard } from '@/app/shared/components/Communities/CommunityCard';
import { FilterPill } from '@/app/shared/components/Filters';
import { IconComponent } from '@/app/shared/components/Icons';
import { useGetInterestCategories } from '@/app/shared/hooks/useAuth';
import { useShowMore } from '@/app/shared/hooks/useShowMore';
import { Community, CommunityCategory } from '@/types/community';
import { Interest } from '@/types/interest';

const VISIBLE = 6;

/**
 * "View by type": one chip per interest - the same list a community picks its
 * categories from - so the reader can always filter, even by a type nothing
 * is tagged with yet. Interests found only on a community are added too. The
 * first type that has communities in the pool is selected by default.
 * Picking a different chip collapses this section's own Show-more.
 */
export const ViewByTypeSection = ({ communities }: { communities: Community[] }) => {
  const { data: interests } = useGetInterestCategories();

  const types = useMemo(() => {
    const byId = new Map<string, Interest | CommunityCategory>();
    ((interests ?? []) as Interest[]).forEach((interest) => byId.set(interest.id, interest));
    communities.forEach((community) =>
      community.categories?.forEach((category) => {
        if (!byId.has(category.id)) byId.set(category.id, category);
      }),
    );
    return Array.from(byId.values());
  }, [interests, communities]);

  const firstWithCommunities = types.find((type) =>
    communities.some((community) =>
      community.categories?.some((category) => category.id === type.id),
    ),
  );

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const activeId = selectedId ?? firstWithCommunities?.id ?? types[0]?.id ?? null;
  const activeType = types.find((type) => type.id === activeId);

  const typeCommunities = useMemo(
    () =>
      activeId
        ? communities
            .filter((community) =>
              community.categories?.some((category) => category.id === activeId),
            )
            .sort((a, b) => (b.membersCount ?? 0) - (a.membersCount ?? 0))
        : [],
    [communities, activeId],
  );

  const { visible, isExpanded, hasMore, toggle, collapse } = useShowMore(typeCommunities, VISIBLE);

  return (
    <section className="mt-8">
      <h2 className="text-[22px] font-bold tracking-[-0.3px] text-brand-ink">View by type</h2>

      {types.length === 0 ? (
        <p className="mt-4 text-[14.5px] text-ink-subtle">No types to filter by yet.</p>
      ) : (
        <div
          role="group"
          aria-label="Community types"
          className="mt-4 flex gap-2 overflow-x-auto pb-0.5 scrollbar-hide"
        >
          {types.map((type) => (
            <FilterPill
              key={type.id}
              label={type.name}
              icon={type.icon}
              isSelected={type.id === activeId}
              className="flex-shrink-0"
              onClick={() => {
                setSelectedId(type.id);
                collapse();
              }}
            />
          ))}
        </div>
      )}

      {activeType && typeCommunities.length === 0 ? (
        <p className="mt-5 text-[14.5px] text-ink-subtle">
          No {activeType.name.toLowerCase()} communities yet.
        </p>
      ) : (
        <div className="mt-5 grid grid-cols-1 gap-x-5 gap-y-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visible.map((community) => (
            <CommunityCard key={community.id} community={community} showMeta={false} />
          ))}
        </div>
      )}

      {hasMore && (
        <button
          type="button"
          onClick={toggle}
          aria-expanded={isExpanded}
          className="mt-3 inline-flex min-h-11 items-center gap-1.5 text-[14.5px] font-semibold text-brand hover:underline"
        >
          {isExpanded ? 'Show less' : `Show more ${activeType?.name.toLowerCase()} communities`}
          <IconComponent
            iconName={isExpanded ? 'ArrowUp01Icon' : 'ArrowDown01Icon'}
            size={16}
            color="currentColor"
          />
        </button>
      )}
    </section>
  );
};
