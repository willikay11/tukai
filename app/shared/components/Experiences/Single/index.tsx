'use client';
import { useState } from 'react';

import { useSession } from 'next-auth/react';
import Image from 'next/image';

import moment from 'moment';
import numeral from 'numeral';

import { Bookmark } from '@/app/shared/components/Bookmark';
import { EventSkeleton } from '@/app/shared/components/Cards';
import { Pills } from '@/app/shared/components/Filters';
import { PhotoImage } from '@/app/shared/components/Images';
import { MEDIA_ZOOM, TITLE_TINT } from '@/app/shared/components/Motion';
import { Button } from '@/components/ui/button';
import { ImageCarousel } from '@/components/ui/imageCarousel';
import { useLocation } from '@/context/LocationContext';
import { cn } from '@/lib/utils';
import { Experience } from '@/types/experience';
import { Photo, coverPhotoUrl, photoUrl } from '@/types/photo';
import { formatDateAndTimeRange } from '@/utils/date-utils';
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
  const { lat, lng } = useLocation();

  if (experience.id.startsWith('placeholder-')) {
    // The row card is much shorter than the default one, so it gets a
    // matching skeleton to stop the grid jumping when results land
    if (variant === 'row') {
      return (
        <div className="flex flex-col">
          <div className="aspect-[4/3] w-full animate-pulse rounded-xl bg-gray-200" />
          <div className="mt-2 h-4 w-3/4 animate-pulse rounded bg-gray-200" />
          <div className="mt-1 h-3 w-1/2 animate-pulse rounded bg-gray-200" />
        </div>
      );
    }

    return <EventSkeleton />;
  }

  // Compact card for horizontal discover rows: single 4:3 image, dark
  // bookmark circle, title, "City · N Kms", community, price and when it runs
  if (variant === 'row') {
    const coverPhoto = coverPhotoUrl(experience.photos, 'md');

    const experienceLat = experience.location?.pointLat;
    const experienceLng = experience.location?.pointLong;
    const distanceKm =
      lat !== undefined && lng !== undefined && experienceLat && experienceLng
        ? haversineKm(lat, lng, experienceLat, experienceLng)
        : null;

    const metaLine = [experience.location?.city, distanceKm !== null ? `${distanceKm} Kms` : null]
      .filter(Boolean)
      .join(' · ');

    // Null for an experience with no start date, rather than a stray comma
    const when = formatDateAndTimeRange(experience.startDate, experience.endDate);

    return (
      <div className="flex flex-col">
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl">
          <PhotoImage
            src={coverPhoto}
            alt={experience.title}
            fill
            sizes="280px"
            className={cn('object-cover', MEDIA_ZOOM)}
            onError={() => setHasError(true)}
          />
          <div className="absolute right-2 top-2">
            <Bookmark
              bookmarked={experience.isBookmarked}
              userId={session?.user?.id}
              experienceId={experience.id}
              itemName={experience.title}
              className="text-white"
            />
          </div>
        </div>

        {/* The community leads: it is who is running this, and it reads as the
            line the rest of the card hangs off - the same order the community
            feed's card uses */}
        {experience.hostCommunity && (
          <span className="mt-2 truncate text-sm text-primary">
            {experience.hostCommunity.title}
          </span>
        )}
        <p
          className={cn(
            'text-base font-bold text-gray-900',
            // Tight under the community line, but it still needs room of its
            // own when there is no community above it
            experience.hostCommunity ? 'mt-0.5' : 'mt-2',
            TITLE_TINT,
          )}
        >
          {experience.title}
        </p>
        {metaLine && <p className="mt-0.5 text-sm text-gray-400">{metaLine}</p>}
        {/* `price_starts_from` is the cheapest ticket by definition, so this is
            a floor whether or not the row tells us there are dearer ones - the
            list endpoint returns no ticket data to judge that by */}
        <p className="mt-2 text-sm font-semibold text-gray-800">
          <span className="font-normal text-gray-400">from </span>
          {experience.priceStartsFrom?.currency}{' '}
          {numeral(experience.priceStartsFrom?.amount).format('0,0')}/person
        </p>
        {when && <p className="mt-0.5 text-sm text-gray-400">{when}</p>}
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
                // A card in a grid, not a gallery - the card rendition is
                // plenty, and the original can be several megabytes
                .map((photo) => photoUrl(photo, 'md')!)}
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
            experienceId={experience.id}
            itemName={experience.title}
            className="text-white"
          />
        </div>
      </div>
      <div className="flex flex-col items-start justify-start bg-transparent">
        <div className="mb-1 flex">
          <p className={cn('text-xs font-bold text-gray-800', TITLE_TINT)}>{experience.title}</p>
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
