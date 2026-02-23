'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Community } from '@/types/community';

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
        <p className="text-xs text-gray-500">Loading communities...</p>
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
            <button
              key={community.id}
              type="button"
              onClick={() => handleToggleCommunity(community)}
              className={`inline-flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-3 text-xs transition-colors ${
                isSelected
                  ? 'bg-green-100 text-primary'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Avatar className="h-6 w-6 shrink-0">
                <AvatarImage src={community.photos?.find(photo => photo.isCover)?.photo} alt={community.title} />
                <AvatarFallback className="bg-emerald-100 text-xs font-semibold text-emerald-700">
                  {community.title.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="max-w-[180px] truncate">{community.title}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
