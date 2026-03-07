'use client';

import { CommunityPill } from '@/components/ui/community-pill';
import { Community } from '@/types/community';

export interface ReviewCommunitiesProps {
  communities?: Community[];
}

export default function ReviewCommunities({ communities }: ReviewCommunitiesProps) {
  // Placeholder - communities invited to the experience would come from props
  // For now, showing a sample structure
  if (!communities || communities.length === 0) {
    return (
      <div className="mt-6">
        <h3 className="text-sm font-semibold text-gray-900">My Invited Communities</h3>
        <p className="mt-2 text-xs text-gray-500">No communities invited yet</p>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <h3 className="text-xs font-semibold text-gray-700">My Invited Communities</h3>
      <div className="mt-2 flex flex-wrap gap-2">
        {communities.map((community) => (
          <CommunityPill key={community.id} community={community} isSelected />
        ))}
      </div>
    </div>
  );
}
