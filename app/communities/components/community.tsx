'use client';
import { useState } from 'react';
import sanitizeHtml from 'sanitize-html';
import { Community } from '@/types/community';
import ImageCarousel from '@/components/ui/imageCarousel';
import { EventSkeleton } from '@/app/components/skeletons';
import { Bookmark02Icon } from '@hugeicons/react-pro';
import clsx from 'clsx';

export default function SingleCommunity({ community }: { community: Community }) {
  const [bookmarked, setBookmarked] = useState<boolean>(false);
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
        <div
          className="absolute right-2 top-2 cursor-pointer"
          onClick={() => setBookmarked(!bookmarked)}
        >
          <Bookmark02Icon
            size={16}
            className={clsx('', {
              'text-white': !bookmarked,
              'text-red-600': bookmarked,
            })}
            variant={bookmarked ? 'solid' : 'twotone'}
          />
        </div>
      </div>
      <div className="flex flex-col items-start justify-start bg-white">
        <div className="mb-1 flex">
          <p className="text-xs font-bold text-gray-800">{community.title}</p>
        </div>
        <div className="mb-1 inline-flex items-center">
          <span className="text-xs font-medium text-gray-700">{displayedText}</span>
        </div>
        <div className="inline-flex items-center"></div>
      </div>
    </div>
  );
}
