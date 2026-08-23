'use client';

import { CommunityDiscoverCard } from '@/app/(experiences)/components/CommunityDiscoverCard';
import { SectionHeader } from '@/app/(experiences)/experiences/components/SectionHeader';
import { CommunityGroup } from '@/utils/community-grouping';

export const CommunityCategoryGroup = ({ group }: { group: CommunityGroup }) => {
  const count = group.communities.length;

  return (
    <section>
      <SectionHeader
        layout="stacked"
        title={group.categoryName}
        subtitle={`${count} ${count === 1 ? 'community' : 'communities'}`}
        icon={group.icon}
        iconBgClass={group.iconBgClass}
        iconColorClass={group.iconColorClass}
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {group.communities.map((community) => (
          <CommunityDiscoverCard
            key={community.id}
            community={community}
            // The card is sized for the Discover scroll row by default
            className="w-full"
            // The list endpoint returns only the owner, so the facepile would
            // otherwise be a single face; this fetches the real members
            showMemberAvatars
          />
        ))}
      </div>
    </section>
  );
};
