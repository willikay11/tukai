'use client';

import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';

import { Bookmark } from '@/app/shared/components/Bookmark';
import { IconComponent } from '@/app/shared/components/Icons';
import { useBookmarkPlace } from '@/app/shared/hooks/usePlaces';
import { Photo } from '@/types/photo';
import { Place } from '@/types/place';
import { PlaceCategory } from '@/types/placeCategory';

export const PlaceCard = ({ place }: { place: Place }) => {
  const { data: session } = useSession();
  const { mutate: bookmarkPlace } = useBookmarkPlace(place.id, session?.user?.id || '');

  const coverPhoto =
    place.photos?.find((photo: Photo) => photo.isCover)?.photo || place.photos?.[0]?.photo;

  // categories mix city and interest groups — only the interest one names the
  // kind of place ("Restaurants", "Nyama Choma"); the city ones are the area
  const category = place.categories?.find(
    (item: PlaceCategory) => item.group === 'interests',
  )?.name;
  const area = place.location?.city || place.location?.name;
  const metaLine = [category, area].filter(Boolean).join(' · ');

  // Most places have no reviews yet, so 0 means "unrated" rather than a score
  const rating = place.averageRating > 0 ? place.averageRating : null;

  return (
    <Link href={`/places/${place.id}`} className="block w-[280px] flex-shrink-0 snap-start">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl">
        {coverPhoto ? (
          <Image src={coverPhoto} alt={place.title} fill sizes="280px" className="object-cover" />
        ) : (
          <div className="h-full w-full bg-gray-100" />
        )}

        <div className="absolute right-2 top-2">
          <Bookmark
            icon="basket"
            bookmarked={place.isBookmarked}
            userId={session?.user?.id}
            onBookmark={() => bookmarkPlace()}
            onUnbookmark={() => bookmarkPlace()}
            className="text-white"
          />
        </div>
      </div>

      <div className="mt-3">
        <div className="flex items-start justify-between gap-2">
          <p className="text-base font-bold text-gray-900">{place.title}</p>
          {rating !== null && (
            <span className="flex flex-shrink-0 items-center gap-1">
              <IconComponent iconName="StarIcon" size={14} className="text-yellow-400" />
              <span className="text-sm font-medium text-gray-800">{rating}</span>
            </span>
          )}
        </div>
        {metaLine && <p className="mt-0.5 text-sm text-gray-400">{metaLine}</p>}
        {/* ⚠️ No average-price line: the places API returns no price field of
            any kind (no price / avg_price / price_level) */}
      </div>
    </Link>
  );
};
