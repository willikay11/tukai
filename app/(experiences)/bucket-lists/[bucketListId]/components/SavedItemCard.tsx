'use client';

import Link from 'next/link';

import numeral from 'numeral';

import { Bookmark } from '@/app/shared/components/Bookmark';
import { PhotoImage } from '@/app/shared/components/Images';
import {
  BucketListItem,
  bucketListItemHref,
  bucketListItemLocation,
  bucketListItemPhoto,
} from '@/types/bucket-list';
import { formatDateAndTimeRange } from '@/utils/date-utils';
import { moneyAmount } from '@/utils/money';

/**
 * One saved thing, drawn from the bookmark the list item wraps.
 *
 * Not the discover cards: those take a whole Experience or Place, where an item
 * carries only the handful of fields the bookmark inlines — title, photo,
 * price, dates, city. Enough for a card, and one request rather than one per
 * saved thing.
 */
export const SavedExperienceCard = ({ item }: { item: BucketListItem }) => {
  const bookmark = item.experienceBookmark;
  const href = bucketListItemHref(item);
  const name = bookmark?.experienceTitle ?? 'Saved experience';

  const dates = formatDateAndTimeRange(bookmark?.startDate, bookmark?.endDate);

  // Money, not a string: rendering the object itself is what took the page down
  const price = moneyAmount(bookmark?.priceStartsFrom);
  const currency =
    typeof bookmark?.priceStartsFrom === 'object' ? (bookmark.priceStartsFrom?.currency ?? '') : '';

  return (
    <SavedCard
      href={href}
      name={name}
      photo={bucketListItemPhoto(item)}
      experienceId={bookmark?.experienceId}
      // The shape an experience takes on the experiences listing
      shape="aspect-[4/3] rounded-xl"
    >
      {price !== null && (
        <p className="mt-0.5 text-sm text-gray-500">
          from{' '}
          <span className="font-semibold text-gray-800">
            {currency} {numeral(price).format('0,0')}
          </span>
        </p>
      )}
      {dates && <p className="mt-0.5 truncate text-sm text-gray-400">{dates}</p>}
    </SavedCard>
  );
};

export const SavedPlaceCard = ({ item }: { item: BucketListItem }) => {
  const bookmark = item.placeBookmark;
  const location = bucketListItemLocation(item);

  return (
    <SavedCard
      href={bucketListItemHref(item)}
      name={bookmark?.placeName ?? 'Saved place'}
      photo={bucketListItemPhoto(item)}
      placeId={bookmark?.placeId}
      // And the shape a place takes on the places listing
      shape="aspect-square rounded-[5px]"
    >
      {location && <p className="mt-0.5 truncate text-sm text-gray-400">{location}</p>}
    </SavedCard>
  );
};

const SavedCard = ({
  href,
  name,
  photo,
  experienceId,
  placeId,
  shape,
  children,
}: {
  href: string | null;
  name: string;
  photo?: string;
  experienceId?: string;
  placeId?: string;
  /** Aspect and radius, taken from the listing this kind appears on */
  shape: string;
  children?: React.ReactNode;
}) => {
  const card = (
    <>
      <div className={`relative w-full overflow-hidden bg-gray-100 ${shape}`}>
        <PhotoImage
          src={photo}
          alt={name}
          fill
          sizes="(max-width: 768px) 45vw, 240px"
          className="object-cover"
        />

        {/* Already on a list, so the basket reads as done — and still opens the
            picker, which is how it is moved onto another one */}
        <div className="absolute right-2 top-2">
          <Bookmark
            bookmarked
            userId="saved"
            experienceId={experienceId}
            placeId={placeId}
            itemName={name}
            className="text-white"
          />
        </div>
      </div>

      <p className="mt-2 text-base font-bold text-gray-900">{name}</p>
      {children}
    </>
  );

  if (!href) return <div className="w-full">{card}</div>;

  return (
    <Link href={href} className="block w-full">
      {card}
    </Link>
  );
};
