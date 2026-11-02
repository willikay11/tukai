'use client';

import Link from 'next/link';

import numeral from 'numeral';

import { Bookmark } from '@/app/shared/components/Bookmark';
import { PhotoImage } from '@/app/shared/components/Images';
import { useExperienceDrawer } from '@/context/ExperienceDrawerContext';
import { usePlaceDrawer } from '@/context/PlaceDrawerContext';
import {
  BucketListItem,
  bucketListItemHref,
  bucketListItemLocation,
  bucketListItemName,
  bucketListItemPhoto,
} from '@/types/bucket-list';
import { formatDateAndTimeRange } from '@/utils/date-utils';
import { moneyAmount } from '@/utils/money';

/** "KES 2,000", "Free", or nothing when the item carries no price. */
const priceLabel = (item: BucketListItem): string | null => {
  const money = item.experienceBookmark?.priceStartsFrom;
  const amount = moneyAmount(money);
  if (amount === null) return null;
  if (amount === 0) return 'Free';

  const currency = typeof money === 'object' ? (money?.currency ?? '') : '';

  return `${currency} ${numeral(amount).format('0,0')}`.trim();
};

/**
 * One experience or place on a list, in the panel.
 *
 * The photo and the text are a single link, opening the experience or place
 * on top of the list; Save is its own button beside it, so the card is two tab
 * stops rather than three. A plain click opens the drawer, and the link keeps
 * its href for a new tab.
 */
export const BucketListItemCard = ({ item }: { item: BucketListItem }) => {
  const experienceDrawer = useExperienceDrawer();
  const placeDrawer = usePlaceDrawer();

  const name = bucketListItemName(item);
  const href = bucketListItemHref(item);
  const experienceId = item.experienceBookmark?.experienceId;
  const placeId = item.placeBookmark?.placeId;

  const handleOpen = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    if (experienceId && experienceDrawer) {
      event.preventDefault();
      experienceDrawer.openExperience(experienceId);
    } else if (placeId && placeDrawer) {
      event.preventDefault();
      placeDrawer.openPlace(placeId);
    }
  };

  const price = experienceId ? priceLabel(item) : null;
  const when = experienceId
    ? formatDateAndTimeRange(item.experienceBookmark?.startDate, item.experienceBookmark?.endDate)
    : null;
  const area = placeId ? bucketListItemLocation(item) : null;

  const body = (
    <>
      <span className="relative block aspect-square w-full overflow-hidden rounded-xl bg-surface">
        <PhotoImage
          src={bucketListItemPhoto(item)}
          alt={name}
          fill
          sizes="(max-width: 720px) 45vw, 200px"
          className="object-cover"
        />
      </span>

      <span className="flex min-w-0 flex-col gap-[3px]">
        <span className="text-[15px] font-semibold leading-[1.35] text-gray-800 [text-wrap:pretty]">
          {name}
        </span>
        {price && (
          <span className="mt-0.5 text-sm text-ink-muted">
            {price === 'Free' ? (
              <span className="font-bold text-gray-800">Free</span>
            ) : (
              <>
                from <span className="font-bold text-gray-800">{price}</span>
              </>
            )}
          </span>
        )}
        {when && <span className="truncate text-[13.5px] text-ink-muted">{when}</span>}
        {area && <span className="truncate text-sm text-ink-muted">{area}</span>}
      </span>
    </>
  );

  return (
    <div className="relative flex min-w-0 flex-col">
      {href ? (
        <Link
          href={href}
          onClick={handleOpen}
          className="flex min-w-0 flex-col gap-2.5 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
        >
          {body}
        </Link>
      ) : (
        <div className="flex min-w-0 flex-col gap-2.5">{body}</div>
      )}

      {/* Already on this list, so the basket reads as saved; it still opens
          the picker, which is where an item is taken off again */}
      <div className="absolute right-0 top-0">
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
  );
};
