'use client';

import { IconComponent } from '@/app/shared/components/Icons';
import { CommunityPill } from '@/components/ui/community-pill';

interface CommunityOption {
  id: string;
  name: string;
  imageUrl: string;
}

interface PreviewCommunitiesSectionProps {
  communityIds: string[];
  allCommunities: CommunityOption[];
  label?: string;
  emptyText?: string;
  onEdit?: () => void;
}

export const PreviewCommunitiesSection = ({
  communityIds,
  allCommunities,
  label = 'Invited Communities',
  emptyText = 'No communities invited yet',
  onEdit,
}: PreviewCommunitiesSectionProps) => {
  const communities = allCommunities.filter((c) => communityIds.includes(c.id));

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between">
        <h3 className="text-xs font-semibold text-gray-900">
          {label} ({communities.length})
        </h3>
        {onEdit && (
          <button type="button" onClick={onEdit} className="text-gray-400 hover:text-gray-600">
            <IconComponent iconName="Edit02Icon" size={16} />
          </button>
        )}
      </div>

      {communities.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          {/* Same pill the host sees while picking communities in the invite step */}
          {communities.map((community) => (
            <CommunityPill
              key={community.id}
              title={community.name}
              photoUrl={community.imageUrl}
            />
          ))}
        </div>
      ) : (
        <p className="text-xs text-gray-500">{emptyText}</p>
      )}
    </div>
  );
};
