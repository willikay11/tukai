'use client';

import { CommunityPill } from '@/components/ui/community-pill';
import { Community } from '@/types/community';

const shimmer =
  'before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent';

interface InviteCommunitiesProps {
  invitedCommunities: Community[];
  onCommunitiesChange: (communities: Community[]) => void;
  availableCommunities: Community[];
  isLoading?: boolean;
  className?: string;
}

export function InviteCommunities({
  invitedCommunities,
  onCommunitiesChange,
  availableCommunities,
  isLoading = false,
  className = '',
}: InviteCommunitiesProps) {
  const handleToggleCommunity = (community: Community) => {
    const isSelected = invitedCommunities.some((c) => c.id === community.id);

    if (isSelected) {
      onCommunitiesChange(invitedCommunities.filter((c) => c.id !== community.id));
    } else {
      onCommunitiesChange([...invitedCommunities, community]);
    }
  };

  if (isLoading) {
    return (
      <div className={`${className}`}>
        <div className={`${shimmer} relative mt-3 flex flex-wrap items-center gap-2`}>
          <div className="h-8 w-24 rounded-full bg-gray-200" />
          <div className="h-8 w-32 rounded-full bg-gray-200" />
          <div className="h-8 w-28 rounded-full bg-gray-200" />
          <div className="h-8 w-36 rounded-full bg-gray-200" />
        </div>
      </div>
    );
  }

  if (availableCommunities.length === 0) {
    return (
      <div className={`${className}`}>
        <p className="text-xs text-gray-500">No communities available</p>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {availableCommunities.map((community) => {
          const isSelected = invitedCommunities.some((c) => c.id === community.id);

          return (
            <CommunityPill
              key={community.id}
              community={community}
              isSelected={isSelected}
              onClick={handleToggleCommunity}
            />
          );
        })}
      </div>
    </div>
  );
}
