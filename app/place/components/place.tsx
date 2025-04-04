'use client';
import { StarIcon } from '@hugeicons/react-pro';
import { useState } from 'react';
import clsx from 'clsx';
import { Place } from '@/types/place';
import ImageCarousel from '@/components/ui/imageCarousel';
import BookmarkPlace from './bookmarkPlace';
import { EventSkeleton } from '@/app/components/skeletons';

export default function SinglePlace({ place }: { place: Place }) {
  const [hasError, setHasError] = useState(false);

  if (place.id.startsWith('placeholder-')) {
    return <EventSkeleton />;
  }

  return (
    <>
      <div className="group relative mb-2 flex flex-col">
        <div className="relative aspect-square w-full overflow-hidden rounded-[5px]">
          {!hasError ? (
            <ImageCarousel images={place.photos.map((photo) => photo.photo)} imageHeight="h-full" />
          ) : (
            <div className="h-full w-full bg-gray-50" />
          )}
        </div>
        <div className="invisible absolute right-2 top-2 cursor-pointer group-hover:visible">
          <BookmarkPlace
            placeId={place.id}
            userId="058b7853-c5f4-4e43-b356-da1e8ce05f6e"
            bookmarked={place.isBookmarked}
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
