'use client';
import { useState } from 'react';

import { useSession } from 'next-auth/react';

import moment from 'moment';
import numeral from 'numeral';

import { Pills } from '@/app/components/pills';
import { EventSkeleton } from '@/app/components/skeletons';
import { Button } from '@/components/ui/button';
import { ImageCarousel } from '@/components/ui/imageCarousel';
import { useBookmarkExperience } from '@/hooks/experiences';
import { cn } from '@/lib/utils';
import { Experience } from '@/types/experience';

import { Bookmark } from '../../bookmark';

export const SingleExperience = ({
  type,
  experience,
}: {
  type: 'discover' | 'invited';
  experience: Experience;
}) => {
  const [hasError, setHasError] = useState(false);
  const { data: session } = useSession();
  const { mutate: bookmarkExperience } = useBookmarkExperience();

  if (experience.id.startsWith('placeholder-')) {
    return <EventSkeleton />;
  }

  const dateSlot = (
    <div className="inline-flex items-center">
      <span className="text-xs font-normal text-gray-500">
        {moment(experience?.startDate).isSame(moment(experience?.endDate), 'day')
          ? `${moment(experience?.startDate).format('MMM D, h:mm A')} - ${moment(experience?.endDate).format('h:mm A')}`
          : `${moment(experience?.startDate).format('MMM D, YYYY HH:mm A')} - ${moment(experience?.endDate).format('MMM D, YYYY HH:mm A')}`}
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
              images={experience.photos
                .sort((a, b) => (b.isCover ? 1 : 0) - (a.isCover ? 1 : 0))
                .map((photo) => photo.photo)}
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
            bookmarked={experience.isBookmarked}
            userId={session?.user?.id}
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
};
