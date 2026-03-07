'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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

  const getCommunityPhoto = (community: Community) => {
    return community.photos?.[0]?.photo;
  };

  const getInitials = (title: string) => {
    return title
      .split(' ')
      .slice(0, 2)
      .map((word) => word[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="mt-6">
      <h3 className="text-xs font-semibold text-gray-700">My Invited Communities</h3>
      <div className="mt-2 flex flex-wrap gap-3">
        {communities.map((community) => (
          <div key={community.id} className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={getCommunityPhoto(community)} alt={community.title} />
              <AvatarFallback className="bg-emerald-100 text-xs text-emerald-700">
                {getInitials(community.title)}
              </AvatarFallback>
            </Avatar>
            <span className="max-w-[120px] truncate text-xs text-gray-700">
              {community.title}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
