'use client';
import { useState } from 'react';

import sanitizeHtml from 'sanitize-html';

import { EventSkeleton } from '@/app/components/skeletons';
import ImageCarousel from '@/components/ui/imageCarousel';
import { Community } from '@/types/community';

import CommunityMembers from './communityMembers';

export default function SingleCommunity({ community, aspectRatio }: { community: Community, aspectRatio?: string }) {
  const [hasError, setHasError] = useState(false);

  // Sanitize text to prevent XSS (if content is dynamic)
  const safeText = sanitizeHtml(community.description);

  // Determine whether to truncate text
  const shouldTruncate = community.description.length > 100;
  const displayedText = !shouldTruncate ? safeText : safeText.slice(0, 100) + '...';

  if (community.id.startsWith('placeholder-')) {
    return <EventSkeleton />;
  }

  return (
    <div className="flex flex-col">
      <div className="relative mb-2 flex flex-col">
        <div className={`relative ${aspectRatio || 'aspect-square'} w-full overflow-hidden rounded-[5px]`}>
          {!hasError ? (
            <ImageCarousel
              images={community.photos.map((photo) => photo.photo)}
              aspectRatio={aspectRatio}
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
          <div className="text-xs font-medium text-gray-700" dangerouslySetInnerHTML={{ __html: displayedText }} />
        </div>
        <CommunityMembers members={community.members} size="20px" />
      </div>
    </div>
  );
}
