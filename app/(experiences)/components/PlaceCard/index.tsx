'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';

import { Bookmark } from '@/app/shared/components/Bookmark';
import { IconComponent } from '@/app/shared/components/Icons';
import { PhotoImage } from '@/app/shared/components/Images';
import { CARD_LIFT, MEDIA_ZOOM, TITLE_TINT } from '@/app/shared/components/Motion';
import { cn } from '@/lib/utils';
import { coverPhotoUrl } from '@/types/photo';
import { Place } from '@/types/place';
import { PlaceCategory } from '@/types/placeCategory';
import { placePath } from '@/utils/detail-paths';

export const PlaceCard = ({ place, priority = false }: { place: Place; priority?: boolean }) => {
  const { data: session } = useSession();

  const coverPhoto = coverPhotoUrl(place.photos, 'md');

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
    <Link
      href={placePath(place)}
      className={cn('group block w-[280px] flex-shrink-0 snap-start', CARD_LIFT)}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl">
        <PhotoImage
          src={coverPhoto}
          alt={place.title}
          fill
          sizes="280px"
          // Above the fold: fetched straight away instead of waiting for the
          // lazy-load observer, which cannot fire until React has painted
          priority={priority}
          className={cn('object-cover', MEDIA_ZOOM)}
        />

        <div className="absolute right-2 top-2">
          <Bookmark
            bookmarked={place.isBookmarked}
            userId={session?.user?.id}
            placeId={place.id}
            itemName={place.title}
            className="text-white"
          />
        </div>
      </div>

      <div className="mt-3">
        <div className="flex items-start justify-between gap-2">
          <p className={cn('text-base font-bold text-gray-900', TITLE_TINT)}>{place.title}</p>
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
