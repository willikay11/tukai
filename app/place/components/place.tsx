'use client';
import Image from 'next/image';
import { Bookmark02Icon, StarIcon } from '@hugeicons/react-pro';
import { useState } from 'react';
import clsx from 'clsx';
import { Place } from '@/types/place';
import ImageCarousel from '@/components/ui/imageCarousel';

export default function SinglePlace({ place }: { place: Place }) {
  const [bookmarked, setBookmarked] = useState<boolean>(false);
  const [hasError, setHasError] = useState(false);

  return (
    <>
      <div className="relative mb-2 flex flex-col">
        <div className="relative aspect-square w-full overflow-hidden rounded-[5px]">
          {!hasError ? (
            <ImageCarousel images={place.photos.map((photo) => photo.photo)} imageHeight="h-full" />
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
          <p className="text-xs font-bold text-gray-800">{place.title}</p>
        </div>
        <div className="mb-1 inline-flex items-center">
          <span className="text-xs text-gray-600">{place?.location?.name}</span>
          <span className="text-xs text-gray-600">{place?.location?.formattedAddress}</span>
          {/*<div className="mx-1 h-[6px] w-[1px] rounded bg-gray-300" />*/}
          {/*<span className="text-xs text-gray-600">{experience.duration}</span>*/}
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
