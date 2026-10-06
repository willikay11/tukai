'use client';

import Link from 'next/link';

import { placeKind } from '@/app/(experiences)/components/PlaceCard/place-fact';
import { IconComponent } from '@/app/shared/components/Icons';
import { PhotoImage } from '@/app/shared/components/Images';
import { usePlaceDrawer } from '@/context/PlaceDrawerContext';
import { coverPhotoUrl } from '@/types/photo';
import { Place } from '@/types/place';
import { placePath } from '@/utils/detail-paths';

/** One decimal place, so a place 1.1 km off reads as that. Under 100 m reads as less than 0.1. */
export const formatNearbyDistance = (km: number): string =>
  km < 0.1 ? 'Less than 0.1 km away' : `${km.toFixed(1)} km away`;

const CARD_CLASS =
  'flex w-full min-w-0 items-center gap-3.5 rounded-xl bg-white py-2.5 pl-2.5 pr-3.5 text-left transition-shadow hover:shadow-md active:scale-[0.99]';

/**
 * A place in the nearby grid: a 72px photo beside its name, kind and distance.
 * It opens in the drawer like the rails' cards, or links to the place's page
 * when there is no drawer above it. With no distance, the line is left out
 * rather than shown as a made-up one.
 */
export const NearbyPlaceCard = ({ place, distanceKm }: { place: Place; distanceKm?: number }) => {
  const drawer = usePlaceDrawer();
  const kind = placeKind(place);

  const body = (
    <>
      {/* The photo is decorative here: the name beside it carries the place */}
      <div className="relative h-[72px] w-[72px] flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
        <PhotoImage
          src={coverPhotoUrl(place.photos, 'md')}
          alt=""
          fill
          sizes="72px"
          className="object-cover"
        />
      </div>

      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-sm font-semibold leading-snug text-brand-ink">{place.title}</span>
        {kind && <span className="text-[12.5px] leading-snug text-ink-muted">{kind}</span>}
        {distanceKm !== undefined && (
          <span className="mt-0.5 flex items-center gap-1.5 text-xs font-semibold text-primary">
            <IconComponent
              iconName="Location01Icon"
              size={14}
              color="currentColor"
              className="flex-shrink-0"
            />
            {formatNearbyDistance(distanceKm)}
          </span>
        )}
      </span>
    </>
  );

  if (drawer) {
    return (
      <button type="button" onClick={() => drawer.openPlace(place.id)} className={CARD_CLASS}>
        {body}
      </button>
    );
  }

  return (
    <Link href={placePath(place)} className={CARD_CLASS}>
      {body}
    </Link>
  );
};
