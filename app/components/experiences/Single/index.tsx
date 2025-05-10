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
import { cn } from '@/lib/utils';
import Pills from '@/app/components/pills';

export default function SingleExperience({
  type,
  experience,
}: {
  type: 'discover' | 'invited';
  experience: Experience;
}) {
  const [bookmarked, setBookmarked] = useState<boolean>(experience.isBookmarked);
  const [hasError, setHasError] = useState(false);

  const { mutate: bookmarkExperience } = useBookmarkExperience();

  if (experience.id.startsWith('placeholder-')) {
    return <EventSkeleton />;
  }

  const dateSlot = (
    <div className="inline-flex items-center">
      <span className="text-xs font-normal text-gray-500">
        {moment(experience?.startDate).format('MMM D, YYYY')} -{' '}
        {moment(experience?.endDate).format('MMM D, YYYY')}
      </span>
    </div>
  );

  return (
    <>
      <div className="relative mb-2 flex flex-col">
        <div
          className={cn('relative w-full overflow-hidden rounded-[5px]', {
            'aspect-square': type === 'discover',
            'aspect-[16/9]': type === 'invited',
          })}
        >
          {!hasError ? (
            <ImageCarousel
              images={experience.photos.map((photo) => photo.photo)}
              aspectRatio={type === 'discover' ? 'aspect-square' : 'aspect-[16/9]'}
            />
          ) : (
            <div className="h-full w-full bg-gray-50" />
          )}
        </div>
        <div className="absolute left-2 top-2">
          <Pills
            pills={experience?.categories?.map((category) => category.name) || []}
            showMax={type === 'discover' ? 1 : 3}
          />
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
          {type === 'invited' && (
            <>
              <div className="mx-1 h-[3px] w-[3px] rounded-full bg-gray-400" />
              {dateSlot}
            </>
          )}
        </div>
        {type === 'discover' && dateSlot}
        <Button variant="primary-text" size="sm">
          {experience.host.displayName ||
            `${experience.host.firstName} ${experience.host.lastName}`}
        </Button>
      </div>
    </>
  );
}
