'use client';
import { useState } from 'react';

import { useSession } from 'next-auth/react';
import Image from 'next/image';

import moment from 'moment';
import numeral from 'numeral';

import { Bookmark } from '@/app/shared/components/Bookmark';
import { EventSkeleton } from '@/app/shared/components/Cards';
import { Pills } from '@/app/shared/components/Filters';
import { IconComponent } from '@/app/shared/components/Icons';
import { useBookmarkExperience } from '@/app/shared/hooks/useExperiences';
import { Button } from '@/components/ui/button';
import { ImageCarousel } from '@/components/ui/imageCarousel';
import { useLocation } from '@/context/LocationContext';
import { cn } from '@/lib/utils';
import { Experience } from '@/types/experience';
import { Photo } from '@/types/photo';
import { haversineKm } from '@/utils/geo-utils';

export const SingleExperience = ({
  type,
  experience,
  variant = 'default',
}: {
  type: 'discover' | 'invited';
  experience: Experience;
  variant?: 'default' | 'row';
}) => {
  const [hasError, setHasError] = useState(false);
  const { data: session } = useSession();
  const { mutate: bookmarkExperience } = useBookmarkExperience();
  const { lat, lng } = useLocation();

  if (experience.id.startsWith('placeholder-')) {
    return <EventSkeleton />;
  }

  // Compact card for horizontal discover rows: single 4:3 image, dark
  // bookmark circle, title, "City · N Kms", community and price lines
  if (variant === 'row') {
    const coverPhoto =
      experience.photos?.find((photo: Photo) => photo.isCover)?.photo ||
      experience.photos?.[0]?.photo;

    const experienceLat = experience.location?.pointLat;
    const experienceLng = experience.location?.pointLong;
    const distanceKm =
      lat !== undefined && lng !== undefined && experienceLat && experienceLng
        ? haversineKm(lat, lng, experienceLat, experienceLng)
        : null;

    const metaLine = [experience.location?.city, distanceKm !== null ? `${distanceKm} Kms` : null]
      .filter(Boolean)
      .join(' · ');

    return (
      <div className="flex flex-col">
        <div className="relative w-full aspect-[4/3] overflow-hidden rounded-xl">
          {coverPhoto && !hasError ? (
            <Image
              src={coverPhoto}
              alt={experience.title}
              fill
              sizes="280px"
              className="object-cover"
              onError={() => setHasError(true)}
            />
          ) : (
            <div className="h-full w-full bg-gray-100" />
          )}
          <div className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm">
            <Bookmark
              bookmarked={experience.isBookmarked}
              userId={session?.user?.id}
              onBookmark={() => bookmarkExperience(experience.id)}
              onUnbookmark={() => bookmarkExperience(experience.id)}
              className="text-white"
            />
          </div>
        </div>

        <p className="mt-2 text-base font-bold text-gray-900">{experience.title}</p>
        {metaLine && <p className="mt-0.5 text-sm text-gray-400">{metaLine}</p>}
        {experience.hostCommunity && (
          <span className="mt-0.5 inline-flex items-center gap-1.5 text-sm text-primary">
            <IconComponent iconName="UserMultipleIcon" size={14} className="text-primary" />
            {experience.hostCommunity.title}
          </span>
        )}
        <p className="mt-0.5 text-sm font-semibold text-primary">
          {experience.priceStartsFrom?.currency}{' '}
          {numeral(experience.priceStartsFrom?.amount).format('0,0')}/person
        </p>
      </div>
    );
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
                .filter((photo: Photo) => photo.mediaType === 'photo' && photo.photo)
                .sort((a, b) => (b.isCover ? 1 : 0) - (a.isCover ? 1 : 0))
                .map((photo) => photo.photo!)}
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
