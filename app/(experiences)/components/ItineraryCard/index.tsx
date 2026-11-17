'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';

import { Bookmark } from '@/app/shared/components/Bookmark';
import { IconComponent } from '@/app/shared/components/Icons';
import { PhotoImage } from '@/app/shared/components/Images';
import { CARD_LIFT, TITLE_TINT } from '@/app/shared/components/Motion';
import { useExperienceDrawer } from '@/context/ExperienceDrawerContext';
import { cn } from '@/lib/utils';
import { Experience } from '@/types/experience';
import { CANVAS_ICONS } from '@/utils/canvas-icons';
import { formatCardDateTime } from '@/utils/date-utils';
import { experiencePath } from '@/utils/detail-paths';

import { experiencePriceLine, experienceRunBy, isFree } from '../ExperienceCard/experience-flag';
import { StopCrossfade } from './StopCrossfade';
import { crossfadeOffset, itineraryCoverPhotos, startingPrice } from './itinerary-card';

const FOCUS_RING =
  'rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2';

/**
 * An itinerary card: a square cover that crossfades through the itinerary's
 * stops, three of them fanned in its bottom corner, and the save control over
 * its top corner. Beneath, the organising community, the title, and when and
 * for how much.
 *
 * `variant` is where it sits. `section` is the Discover itineraries rail and
 * grid: title clamped to two lines, "from" price before the date. `grid` is
 * the Discover experiences grid, where it sits among experience cards: their
 * line order and price, and an "Itinerary" flag to tell it apart.
 *
 * Cover and text are one link, so a keyboard reader passes one stop per card
 * rather than two that go to the same place; Save sits outside it. A plain
 * click opens the itinerary in the experience drawer, as `ExperienceCard`
 * does, and the link still works for a new tab.
 */
export const ItineraryCard = ({
  itinerary,
  variant = 'section',
  position = 0,
  priority = false,
  className,
  style,
}: {
  itinerary: Experience;
  variant?: 'section' | 'grid';
  /** The card's place among its neighbours, which staggers the first play-through. */
  position?: number;
  priority?: boolean;
  className?: string;
  /** The rail's measured card width. */
  style?: React.CSSProperties;
}) => {
  const { data: session } = useSession();
  const drawer = useExperienceDrawer();

  const photos = itineraryCoverPhotos(itinerary.photos);
  const host = experienceRunBy(itinerary);
  const when = formatCardDateTime(itinerary.startDate, itinerary.endDate);

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    // A modifier asks the browser for something else - a new tab, a new window -
    // and the link should do that rather than the drawer
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    event.preventDefault();
    event.stopPropagation();
    // nextjs-toploader's click listener and React's own delegated listener
    // are both on `document` - siblings, not ancestor and descendant - so
    // `stopPropagation()` alone cannot stop it. See the identical note in
    // ExperienceCard.
    event.nativeEvent.stopImmediatePropagation();
    drawer?.openExperience(itinerary.id);
  };

  return (
    <div className={cn('group relative min-w-0', CARD_LIFT, className)} style={style}>
      <Link
        href={experiencePath(itinerary)}
        onClick={drawer ? handleOpen : undefined}
        className={cn('flex min-w-0 flex-col gap-[9px]', FOCUS_RING)}
      >
        <span className="relative block aspect-square w-full overflow-hidden rounded-xl bg-surface">
          {/* The title is the link's own text below, so the photo stays
              unnamed rather than reading it twice */}
          <StopCrossfade
            photos={photos}
            alt=""
            offsetMs={crossfadeOffset(position)}
            sizes="(min-width: 1536px) 16vw, 184px"
            priority={priority}
          />

          {variant === 'grid' && (
            <span className="absolute left-2.5 top-2.5 z-[3] inline-flex h-[26px] items-center gap-[5px] rounded-full bg-black/55 px-2.5 text-[11.5px] font-bold text-white backdrop-blur-md">
              <IconComponent iconName={CANVAS_ICONS.pin} size={14} color="currentColor" />
              Itinerary
            </span>
          )}

          <StopFan photos={photos.slice(1)} />
        </span>

        <span className="flex min-w-0 flex-col gap-0.5">
          {host && <span className="truncate text-[10px] font-semibold text-brand">{host}</span>}

          <span
            className={cn(
              'text-sm font-semibold leading-[1.35] text-brand-ink',
              variant === 'section' ? 'line-clamp-2' : '[text-wrap:pretty]',
              TITLE_TINT,
            )}
          >
            {itinerary.title}
          </span>

          {variant === 'section' ? (
            <>
              <PriceFrom itinerary={itinerary} />
              {when && <span className="text-[12.5px] text-ink-muted">{when}</span>}
            </>
          ) : (
            <>
              {when && <span className="text-[12.5px] text-ink-muted">{when}</span>}
              <GridPrice itinerary={itinerary} />
            </>
          )}
        </span>
      </Link>

      {/* Outside the link: saving never opens the itinerary */}
      <div className="absolute right-0 top-0 z-[4]">
        <Bookmark
          bookmarked={itinerary.isBookmarked}
          userId={session?.user?.id}
          experienceId={itinerary.id}
          itemName={itinerary.title}
          className="text-white"
        />
      </div>
    </div>
  );
};

/** "from KES 6,500", or "Free". Nothing when the API has no price. */
const PriceFrom = ({ itinerary }: { itinerary: Experience }) => {
  if (isFree(itinerary)) {
    return <span className="mt-0.5 text-[13px] font-semibold text-ink-pill">Free</span>;
  }

  const price = startingPrice(itinerary);
  if (!price) return null;

  return (
    <span className="mt-0.5 text-[13px] text-ink-muted">
      from <span className="font-semibold text-ink-pill">{price}</span>
    </span>
  );
};

/** "KES 6,500/person", the experience card's own price line. */
const GridPrice = ({ itinerary }: { itinerary: Experience }) => {
  const line = experiencePriceLine(itinerary);
  if (!line) return null;

  return <span className="mt-0.5 text-[13px] font-semibold text-ink-pill">{line}</span>;
};

/**
 * Stops two to four fanned over the cover's corner: the middle one in front,
 * the outer two tilted out behind it. With fewer, the ones there keep their
 * place in the fan.
 */
const StopFan = ({ photos }: { photos: string[] }) => {
  const [left, centre, right] = photos;
  if (!left) return null;

  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute bottom-2.5 right-2.5 z-[3] h-[42px] w-[66px]"
    >
      <StopTile
        src={left}
        className="bottom-px left-0 h-8 w-[30px] -rotate-[14deg] rounded-[7px]"
      />
      {right && (
        <StopTile
          src={right}
          className="bottom-px right-0 h-8 w-[30px] rotate-[14deg] rounded-[7px]"
        />
      )}
      {/* Last, so it sits on top */}
      {centre && (
        <StopTile src={centre} className="bottom-[3px] left-4 h-9 w-[34px] rounded-[8px]" />
      )}
    </span>
  );
};

const StopTile = ({ src, className }: { src: string; className: string }) => (
  <span
    className={cn(
      'absolute block overflow-hidden border-2 border-white bg-surface shadow-[0_2px_7px_rgba(0,0,0,.3)]',
      className,
    )}
  >
    <PhotoImage src={src} alt="" fill sizes="36px" className="object-cover" />
  </span>
);
