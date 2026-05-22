'use client';

import { IconComponent } from '@/app/shared/components/Icons';

interface CommunityOption {
  id: string;
  name: string;
  imageUrl: string;
}

interface PreviewCommunitiesSectionProps {
  communityIds: string[];
  allCommunities: CommunityOption[];
  onEdit?: () => void;
}

export const PreviewCommunitiesSection = ({
  communityIds,
  allCommunities,
  onEdit,
}: PreviewCommunitiesSectionProps) => {
  const communities = allCommunities.filter((c) => communityIds.includes(c.id));

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between">
        <h3 className="text-xs font-semibold text-gray-900">
          Invited Communities ({communities.length})
        </h3>
        {onEdit && (
          <button type="button" onClick={onEdit} className="text-gray-400 hover:text-gray-600">
            <IconComponent iconName="Edit02Icon" size={16} />
          </button>
        )}
      </div>

      {communities.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {communities.map((community) => (
            <div
              key={community.id}
              className="flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs"
            >
              <img
                src={community.imageUrl}
                alt={community.name}
                className="h-4 w-4 rounded-full object-cover"
              />
              <span className="max-w-xs truncate">{community.name}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-gray-500">No communities invited yet</p>
      )}
    </div>
  );
};
