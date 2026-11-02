'use client';

import { useMemo, useState } from 'react';

import { CommunityCard } from '@/app/shared/components/Communities/CommunityCard';
import { FilterPill } from '@/app/shared/components/Filters';
import { IconComponent } from '@/app/shared/components/Icons';
import { useShowMore } from '@/app/shared/hooks/useShowMore';
import { Community, CommunityCategory } from '@/types/community';

const VISIBLE = 6;

/**
 * "View by type": one chip per interest that has communities among the pool
 * it is given (communities the reader does not already own), the first
 * selected by default. Picking a different chip collapses this section's own
 * Show-more.
 */
export const ViewByTypeSection = ({ communities }: { communities: Community[] }) => {
  const types = useMemo(() => {
    const byId = new Map<string, CommunityCategory>();
    communities.forEach((community) =>
      community.categories?.forEach((category) => byId.set(category.id, category)),
    );
    return Array.from(byId.values());
  }, [communities]);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const activeId = selectedId ?? types[0]?.id ?? null;
  const activeType = types.find((type) => type.id === activeId);

  const typeCommunities = useMemo(
    () =>
      activeId
        ? communities
            .filter((community) => community.categories?.some((category) => category.id === activeId))
            .sort((a, b) => (b.membersCount ?? 0) - (a.membersCount ?? 0))
        : [],
    [communities, activeId],
  );

  const { visible, isExpanded, hasMore, toggle, collapse } = useShowMore(typeCommunities, VISIBLE);

  if (types.length === 0) return null;

  return (
    <section className="mt-8">
      <h2 className="text-[22px] font-bold tracking-[-0.3px] text-brand-ink">View by type</h2>

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
