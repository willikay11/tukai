'use client';
import { useState } from 'react';
import { Experience } from '@/types/experience';
import ImageCarousel from '@/components/ui/imageCarousel';
import numeral from 'numeral';
import moment from 'moment';
import { Button } from '@/components/ui/button';
import { EventSkeleton } from '@/app/components/skeletons';
import Bookmark from '../../bookmark';
import { useBookmarkExperience } from '@/hooks/experiences';

export default function SingleExperience({ experience }: { experience: Experience }) {
  const [bookmarked, setBookmarked] = useState<boolean>(experience.isBookmarked);
  const [hasError, setHasError] = useState(false);

  const { mutate: bookmarkExperience } = useBookmarkExperience();

  if (experience.id.startsWith('placeholder-')) {
    return <EventSkeleton />;
  }

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
        <div className="absolute right-2 top-2">
          <Bookmark
            bookmarked={bookmarked}
            onBookmark={() => bookmarkExperience(experience.id)}
            onUnbookmark={() => bookmarkExperience(experience.id)}
          />
        </div>
      </div>
      <div className="flex flex-col items-start justify-start bg-transparent">
        <div className="mb-1 flex">
          <p className="text-xs font-bold text-gray-800">{experience.title}</p>
        </div>
        <div className="mb-1 inline-flex items-center">
          <span className="text-xs font-medium text-gray-700">
            {experience?.priceStartsFrom.currency}{' '}
            {numeral(experience?.priceStartsFrom.amount).format('0,0')} / person
          </span>
        </div>
        <div className="inline-flex items-center">
          <span className="text-xs font-medium text-gray-700">
            {moment(experience?.startDate).format('MMM D, YYYY')} -{' '}
            {moment(experience?.endDate).format('MMM D, YYYY')}
          </span>
        </div>
        <Button variant="primary-text" size="sm">
          {experience.host.displayName || `${experience.host.firstName} ${experience.host.lastName}`}
        </Button>
      </div>
    </>
  );
}
