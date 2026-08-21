'use client';

import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';

import numeral from 'numeral';

import { Bookmark } from '@/app/shared/components/Bookmark';
import { IconComponent } from '@/app/shared/components/Icons';
import { useBookmarkExperience } from '@/app/shared/hooks/useExperiences';
import { Experience } from '@/types/experience';
import { Photo } from '@/types/photo';
import { getNumberOfDaysAndNights } from '@/utils/date-utils';

import { StackedPhotosBadge } from './StackedPhotosBadge';

export const ItineraryCard = ({ itinerary }: { itinerary: Experience }) => {
  const { data: session } = useSession();
  const { mutate: bookmarkExperience } = useBookmarkExperience();

  const photos = (itinerary.photos ?? []).filter((photo: Photo) => photo.photo);
  const coverPhoto = photos.find((photo: Photo) => photo.isCover)?.photo || photos[0]?.photo;
  const previewPhotos = photos
    .map((photo: Photo) => photo.photo!)
    .filter((photo) => photo !== coverPhoto)
    .slice(0, 3);

  // The list response carries no itinerary_duration_days, so the span is
  // derived from the dates it does return
  const { days } =
    itinerary.startDate && itinerary.endDate
      ? getNumberOfDaysAndNights(itinerary.startDate, itinerary.endDate)
      : { days: 0 };
  const daysLabel = days > 0 ? `${days} ${days === 1 ? 'day' : 'days'}` : null;

  const price = itinerary.priceStartsFrom;

  return (
    <Link
      href={`/experiences/${itinerary.id}`}
      className="block w-[300px] flex-shrink-0 snap-start"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl">
        {coverPhoto ? (
          <Image
            src={coverPhoto}
            alt={itinerary.title}
            fill
            sizes="300px"
            className="object-cover"
          />
        ) : (
          <div className="h-full w-full bg-gray-100" />
        )}

        <div className="absolute right-2 top-2">
          <Bookmark
            icon="basket"
            bookmarked={itinerary.isBookmarked}
            userId={session?.user?.id}
            onBookmark={() => bookmarkExperience(itinerary.id)}
            onUnbookmark={() => bookmarkExperience(itinerary.id)}
            className="text-white"
          />
        </div>

        <StackedPhotosBadge photos={previewPhotos} className="absolute bottom-3 left-3" />
      </div>

      <div className="mt-3">
        <p className="text-base font-bold text-gray-900">{itinerary.title}</p>
        {/* ⚠️ No "N stops": the list response carries no activity/stop count.
            It would take one /itinerary-days/ request per card to get it. */}
        {daysLabel && (
          <p className="mt-0.5 flex items-center gap-1.5 text-sm text-gray-400">
            <IconComponent iconName="Calendar03Icon" size={13} color="currentColor" />
            {daysLabel}
          </p>
        )}
        {price && (
          <p className="mt-1 text-sm font-semibold text-primary">
            From {price.currency} {numeral(price.amount).format('0,0')}
          </p>
        )}
      </div>
    </Link>
  );
};
