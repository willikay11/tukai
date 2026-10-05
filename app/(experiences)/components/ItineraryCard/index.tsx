'use client';

import { useSession } from 'next-auth/react';

import { Bookmark } from '@/app/shared/components/Bookmark';
import { CardShell } from '@/app/shared/components/Cards/CardShell';
import { PhotoImage } from '@/app/shared/components/Images';
import { TITLE_TINT } from '@/app/shared/components/Motion';
import { cn } from '@/lib/utils';
import { Experience } from '@/types/experience';
import { Photo, coverPhotoUrl, photoUrl } from '@/types/photo';
import { formatItineraryDateRange } from '@/utils/date-utils';
import { experiencePath } from '@/utils/detail-paths';
import { moneyAmount } from '@/utils/money';

import { experienceRunBy, isFree } from '../ExperienceCard/experience-flag';

/**
 * An itinerary, as the canvas draws it in a rail: a square photo at 184px with
 * the save control over its top corner and three stop photos fanned in its
 * bottom corner. Beneath, the host, the title, the starting price and the dates.
 *
 * The stop photos are the itinerary's own photos after the cover - the list
 * response carries no stop list, so the cover is the only thing guaranteed.
 */
export const ItineraryCard = ({ itinerary }: { itinerary: Experience }) => {
  const { data: session } = useSession();

  const cover = coverPhotoUrl(itinerary.photos, 'md');
  const stops = stopPhotos(itinerary.photos, cover);

  const host = experienceRunBy(itinerary);
  const price = startingPriceLine(itinerary);
  const when =
    itinerary.startDate && itinerary.endDate
      ? formatItineraryDateRange(itinerary.startDate, itinerary.endDate)
      : null;

  return (
    <CardShell
      href={experiencePath(itinerary)}
      src={cover}
      alt={itinerary.title}
      sizes="184px"
      ratio="square"
      radius="rounded-xl"
      className="w-[184px] flex-shrink-0 snap-start"
      overlay={
        <>
          <div className="absolute right-0 top-0">
            <Bookmark
              bookmarked={itinerary.isBookmarked}
              userId={session?.user?.id}
              experienceId={itinerary.id}
              itemName={itinerary.title}
              className="text-white"
            />
          </div>

          {stops.length > 0 && <StopPhotos photos={stops} />}
        </>
      }
    >
      <div className="mt-[9px] flex flex-col gap-0.5">
        {host && <span className="truncate text-[10px] font-semibold text-brand">{host}</span>}

        <p
          className={cn(
            'line-clamp-2 text-sm font-semibold leading-snug text-brand-ink',
            TITLE_TINT,
          )}
        >
          {itinerary.title}
        </p>

        {price && <p className="mt-0.5 text-[13px] text-ink-muted">{price}</p>}

        {when && <p className="text-[12.5px] text-ink-muted">{when}</p>}
      </div>
    </CardShell>
  );
};

/** Up to three non-cover photos, in the order the API returns them. */
const stopPhotos = (photos: Photo[] | null | undefined, cover: string | undefined): string[] =>
  (photos ?? [])
    .map((photo) => photoUrl(photo, 'md'))
    .filter((url): url is string => Boolean(url) && url !== cover)
    .slice(0, 3);

/** "Free", or "from KES 3,000". Nothing when the API has no price. */
const startingPriceLine = (itinerary: Experience): string | null => {
  if (isFree(itinerary)) return 'Free';

  const amount = moneyAmount(itinerary.priceStartsFrom);
  if (amount === null) return null;

  const currency = itinerary.priceStartsFrom?.currency ?? '';
  return `from ${currency} ${amount.toLocaleString('en-US')}`.trim();
};

/**
 * Three small photos fanned in the corner: the second sits centred and in
 * front, the first and third tilt out behind it. With fewer than three, the
 * ones there are keep their place in the fan.
 */
const StopPhotos = ({ photos }: { photos: string[] }) => {
  const [first, second, third] = photos;

  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute bottom-2.5 right-2.5 h-[42px] w-[66px]"
    >
      {first && <StopTile src={first} className="bottom-px left-0 h-8 w-[30px] -rotate-[14deg]" />}
      {third && <StopTile src={third} className="bottom-px right-0 h-8 w-[30px] rotate-[14deg]" />}
      {second && <StopTile src={second} className="bottom-[3px] left-4 h-9 w-[34px]" />}
    </span>
  );
};

const StopTile = ({ src, className }: { src: string; className: string }) => (
  <span
    className={cn(
      'absolute block overflow-hidden rounded-lg border-2 border-white bg-gray-200 shadow-md',
      className,
    )}
  >
    <PhotoImage src={src} alt="" fill sizes="36px" className="object-cover" />
  </span>
);
