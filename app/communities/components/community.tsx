'use client';
import { useState } from 'react';
import sanitizeHtml from 'sanitize-html';
import { Community, CommunityMember } from '@/types/community';
import ImageCarousel from '@/components/ui/imageCarousel';
import { EventSkeleton } from '@/app/components/skeletons';
import clsx from 'clsx';
import { Avatar, AvatarImage } from '@/components/ui/avatar';

export default function SingleCommunity({ community }: { community: Community }) {
  const [hasError, setHasError] = useState(false);

  // Sanitize text to prevent XSS (if content is dynamic)
  const safeText = sanitizeHtml(community.description);

  // Determine whether to truncate text
  const shouldTruncate = community.description.length > 100;
  const displayedText = !shouldTruncate
    ? safeText
    : safeText.slice(0, 100) + '...';

  if (community.id.startsWith('placeholder-')) {
    return <EventSkeleton />;
  }
  
  return (
    <div className="flex flex-col">
      <div className="relative mb-2 flex flex-col">
        <div className="relative aspect-square w-full overflow-hidden rounded-[5px]">
          {!hasError ? (
            <ImageCarousel
              images={community.photos.map((photo) => photo.photo)}
              imageHeight="h-full"
            />
          ) : (
            <div className="h-full w-full bg-gray-50" />
          )}
        </div>
      </div>
      <div className="flex flex-col items-start justify-start bg-white">
        <div className="mb-1 flex">
          <p className="text-xs font-bold text-gray-800">{community.title}</p>
        </div>
        <div className="mb-1 inline-flex items-center">
          <span className="text-xs font-medium text-gray-700">{displayedText}</span>
        </div>
        <div className="flex items-center relative">
          {
            community.members.slice(0, 5).map((member: CommunityMember, index: number) => (
              <div key={member.id} className={clsx('relative rounded-full bg-gray-200', index === 0 && 'ml-0', index > 0 && `-ml-1`)}>
                <Avatar className="h-[20px] w-[20px]">
                  <AvatarImage src={member.user.picture} />
                </Avatar>
              </div>
            ))
          }
          {community.members.length > 5 && (
            <span className="text-xs font-medium text-gray-700 ml-1">{`+${community.members.length - 5}`}</span>
          )}
        </div>
      </div>
    </div>
  );
}
