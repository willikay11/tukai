'use client';

import { useSession } from 'next-auth/react';

import { Bookmark } from '@/app/shared/components/Bookmark';
import { CardShell } from '@/app/shared/components/Cards/CardShell';
import { IconComponent } from '@/app/shared/components/Icons';
import { TITLE_TINT } from '@/app/shared/components/Motion';
import { useLocation } from '@/context/LocationContext';
import { usePlaceDrawer } from '@/context/PlaceDrawerContext';
import { cn } from '@/lib/utils';
import { coverPhotoUrl } from '@/types/photo';
import { Place } from '@/types/place';
import { placePath } from '@/utils/detail-paths';
import { formatNearbyDistance, greatCircleKm } from '@/utils/geo-utils';

import { placeLocality } from './place-fact';

/** The width a card takes in a rail. In a grid it fills the cell instead. */
const RAIL_WIDTH = 'w-[184px] flex-shrink-0 snap-start';

/**
 * A place, as the canvas draws it: a square photo at 184px, the save control
 * over its corner, then the name and where it is - a distance once the
 * reader has opted into their own location, the city otherwise.
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
  const { isUsingLocation, lat, lng } = useLocation();

  // Distance takes the line over the city once the reader has opted into
  // their own location - a city they already set as home tells them less
  // than how far this particular place is from them. The place's own
  // coordinates are not guaranteed on the list payload, so this falls back
  // to the city rather than showing a distance computed from nothing.
  const placeLat = place.location?.pointLat;
  const placeLng = place.location?.pointLong;
  const distanceKm =
    isUsingLocation && lat !== undefined && lng !== undefined && placeLat && placeLng
      ? greatCircleKm(lat, lng, placeLat, placeLng)
      : undefined;

  const locality =
    distanceKm !== undefined ? formatNearbyDistance(distanceKm) : placeLocality(place);

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

        {locality && (
          <p className="flex items-center gap-1 text-[12.5px] font-semibold text-ink-muted">
            <IconComponent
              iconName="Location01Icon"
              size={13}
              color="currentColor"
              className="flex-shrink-0"
            />
            {locality}
          </p>
        )}
      </div>
    </CardShell>
  );
};
