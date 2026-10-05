'use client';

import { useSession } from 'next-auth/react';

import { Bookmark } from '@/app/shared/components/Bookmark';
import { CardShell } from '@/app/shared/components/Cards/CardShell';
import { IconComponent } from '@/app/shared/components/Icons';
import { TITLE_TINT } from '@/app/shared/components/Motion';
import { usePlaceDrawer } from '@/context/PlaceDrawerContext';
import { cn } from '@/lib/utils';
import { coverPhotoUrl } from '@/types/photo';
import { Place } from '@/types/place';
import { placePath } from '@/utils/detail-paths';

import { placeFact, placeLocality } from './place-fact';

const FACT_TONE: Record<string, string> = {
  event: 'text-brand',
  plain: 'text-gray-900',
  muted: 'text-ink-muted',
};

/** The width a card takes in a rail. In a grid it fills the cell instead. */
const RAIL_WIDTH = 'w-[184px] flex-shrink-0 snap-start';

/**
 * A place, as the canvas draws it: a square photo at 184px, the save control
 * over its corner, then the name, where it is, and one line of substance.
 */
export const PlaceCard = ({
  place,
  priority = false,
  className = RAIL_WIDTH,
}: {
  place: Place;
  priority?: boolean;
  /** Overridden where the card fills a grid cell instead of sitting in a rail. */
  className?: string;
}) => {
  const { data: session } = useSession();
  const drawer = usePlaceDrawer();

  const fact = placeFact(place);
  const locality = placeLocality(place);

  return (
    <CardShell
      // A place opens in the drawer, not on a page of its own - so no href,
      // and nothing to open in a new tab. Without a drawer above it the card
      // falls back to the place's own page.
      href={drawer ? undefined : placePath(place)}
      onClick={drawer ? () => drawer.openPlace(place.id) : undefined}
      src={coverPhotoUrl(place.photos, 'md')}
      alt={place.title}
      sizes="184px"
      // Above the fold: fetched straight away instead of waiting for the
      // lazy-load observer, which cannot fire until React has painted
      priority={priority}
      ratio="square"
      radius="rounded-xl"
      className={className}
      overlay={
        // Top-right, over the photo
        <div className="absolute right-0 top-0">
          <Bookmark
            bookmarked={place.isBookmarked}
            userId={session?.user?.id}
            placeId={place.id}
            itemName={place.title}
            className="text-white"
          />
        </div>
      }
    >
      <div className="mt-[9px] flex flex-col gap-0.5">
        <p className={cn('text-sm font-semibold leading-snug text-brand-ink', TITLE_TINT)}>
          {place.title}
        </p>

        {locality && <p className="text-[12.5px] text-ink-muted">{locality}</p>}

        <p
          className={cn(
            'mt-0.5 flex items-start gap-1.5 text-xs font-semibold leading-4',
            FACT_TONE[fact.tone],
          )}
        >
          <IconComponent
            iconName={fact.icon}
            size={15}
            color="currentColor"
            className="flex-shrink-0"
          />
          {fact.text}
        </p>
      </div>
    </CardShell>
  );
};
