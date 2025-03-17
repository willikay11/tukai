'use client';
import { Bookmark02Icon } from '@hugeicons/react-pro';
import { useState } from 'react';
import clsx from 'clsx';
import { Experience } from '@/types/experience';
import ImageCarousel from '@/components/ui/imageCarousel';
import numeral from 'numeral';
import moment from 'moment';
import { Button } from '@/components/ui/button';

export default function SingleExperience({ experience }: { experience: Experience }) {
  const [bookmarked, setBookmarked] = useState<boolean>(false);
  const [hasError, setHasError] = useState(false);

  console.log(experience);

  return (
    <>
      <div className="relative mb-2 flex flex-col">
        <div className="relative aspect-square w-full overflow-hidden rounded-[5px]">
          {!hasError ? (
            <ImageCarousel
              images={experience.photos.map((photo) => photo.photo)}
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
          <p className="text-xs font-bold text-gray-800">{experience.title}</p>
        </div>
        <div className="mb-1 inline-flex items-center">
          <span className="text-xs font-medium text-gray-700">
            {experience?.priceStartsFrom.currency}{' '}
            {numeral(experience?.priceStartsFrom.amount).format('0,0')} /person
          </span>
        </div>
        <div className="inline-flex items-center">
          <span className="text-xs font-normal text-gray-700">
            {moment(experience?.startDate).format('MMM D, YYYY')} -{' '}
            {moment(experience?.endDate).format('MMM D, YYYY')}
          </span>
        </div>
        <Button variant="primary-text" size="sm">
          {experience.host.displayName}
        </Button>
      </div>
    </>
  );
}
