'use client';
import { useState } from 'react';

import { useSession } from 'next-auth/react';

import { StarIcon } from '@hugeicons/react-pro';
import clsx from 'clsx';

import BookmarkPlace from '@/app/components/bookmark';
import { EventSkeleton } from '@/app/components/skeletons';
import ImageCarousel from '@/components/ui/imageCarousel';
import { useBookmarkPlace } from '@/hooks/places';
import { Place } from '@/types/place';

export default function SinglePlace({ place }: { place: Place }) {
  const [hasError, setHasError] = useState(false);
  const { data: session } = useSession();
  const { mutate: bookmarkPlace } = useBookmarkPlace(place.id, session?.user?.id || '');

  if (place.id.startsWith('placeholder-')) {
    return <EventSkeleton />;
  }

  return (
    <>
      <div className="group relative mb-2 flex flex-col">
        <div className="relative aspect-square w-full overflow-hidden rounded-[5px]">
          {!hasError ? (
            <ImageCarousel
              images={place.photos
                .sort((a, b) => (b.isCover ? 1 : 0) - (a.isCover ? 1 : 0))
                .map((photo) => photo.photo)}
              imageHeight="h-full"
            />
          ) : (
            <div className="h-full w-full bg-gray-50" />
          )}
        </div>
        <div className="invisible absolute right-2 top-2 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-gray-800/50 p-1 group-hover:visible">
          <BookmarkPlace
            userId={session?.user?.id}
            bookmarked={place.isBookmarked}
            onBookmark={() => bookmarkPlace()}
            onUnbookmark={() => bookmarkPlace()}
            className="text-white"
          />
        </div>
      </div>
      <div className="flex flex-col items-start justify-start bg-white">
        <div className="mb-1 flex">
          <p className="text-xs font-bold text-gray-800">{place.title}</p>
        </div>
        <div className="mb-1 inline-flex items-center">
          <span className="text-xs text-gray-600">{place?.location?.name}</span>
          <span className="text-xs font-medium text-gray-600">
            {place?.location?.formattedAddress}
          </span>
        </div>
        <div className="inline-flex items-center">
          <StarIcon
            variant="solid"
            size={14}
            className={clsx('mr-1', {
              'text-yellow-400': place.averageRating > 0,
              'text-gray-300': place.averageRating === 0,
            })}
          />
          <span className="text-xs text-gray-600">{place.averageRating}</span>
          <div className="mx-1 h-[6px] w-[1px] rounded bg-gray-300" />
          <span className="text-xs text-gray-600">{place.totalReviews} Reviews</span>
        </div>
      </div>
    </>
  );
}
