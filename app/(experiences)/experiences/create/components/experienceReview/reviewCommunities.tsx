'use client';

import { IconComponent } from '@/app/components/iconComponent';
import { CommunityPill } from '@/components/ui/community-pill';
import { Community } from '@/types/community';

export interface ReviewCommunitiesProps {
  communities?: Community[];
  editable?: boolean;
  onEdit?: () => void;
}

export const ReviewCommunities = ({
  communities,
  editable = false,
  onEdit,
}: ReviewCommunitiesProps) => {
  // Placeholder - communities invited to the experience would come from props
  // For now, showing a sample structure
  if (!communities || communities.length === 0) {
    return (
      <div className="mt-6">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-base font-semibold text-gray-700">My Invited Communities</h3>
          <button
            type="button"
            onClick={onEdit}
            disabled={editable === false}
            className="text-gray-400 transition-colors hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Edit Invited Communities"
          >
            <IconComponent iconName="Edit02Icon" size={16} className="text-primary" />
          </button>
        </div>
        <p className="mt-2 text-xs text-gray-500">No communities invited yet</p>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-xs font-semibold text-gray-700">My Invited Communities</h3>
        <button
          type="button"
          onClick={onEdit}
          disabled={editable === false}
          className="text-gray-400 transition-colors hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Edit Invited Communities"
        >
          <IconComponent iconName="Edit02Icon" size={16} />
        </button>
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {communities.map((community) => (
          <CommunityPill key={community.id} community={community} isSelected />
        ))}
      </div>
    </div>
  );
};
