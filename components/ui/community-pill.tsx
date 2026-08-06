'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Community } from '@/types/community';

interface CommunityPillProps {
  title: string;
  photoUrl?: string;
  isSelected?: boolean;
  onClick?: () => void;
  className?: string;
}

export function getCommunityPhoto(community: Community) {
  return community.photos?.find((photo) => photo.isCover)?.photo || community.photos?.[0]?.photo;
}

function getInitials(title: string) {
  return title
    .split(' ')
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();
}

export function CommunityPill({
  title,
  photoUrl,
  isSelected = false,
  onClick,
  className = '',
}: CommunityPillProps) {
  const containerClass = `inline-flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-3 text-xs transition-colors ${
    isSelected ? 'bg-green-100 text-primary' : 'bg-gray-100 text-gray-700'
  } ${onClick ? 'hover:bg-gray-200' : ''} ${className}`;

  const content = (
    <>
      <Avatar className="h-6 w-6 shrink-0">
        <AvatarImage src={photoUrl} alt={title} />
        <AvatarFallback className="bg-emerald-100 text-xs font-semibold text-emerald-700">
          {getInitials(title)}
        </AvatarFallback>
      </Avatar>
      <span className="max-w-[180px] truncate">{title}</span>
    </>
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={containerClass}>
        {content}
      </button>
    );
  }

  return <div className={containerClass}>{content}</div>;
}
