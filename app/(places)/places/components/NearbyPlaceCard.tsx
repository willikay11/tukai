'use client';

import Link from 'next/link';

import { placeLocality } from '@/app/(experiences)/components/PlaceCard/place-fact';
import { IconComponent } from '@/app/shared/components/Icons';
import { PhotoImage } from '@/app/shared/components/Images';
import { usePlaceDrawer } from '@/context/PlaceDrawerContext';
import { coverPhotoUrl } from '@/types/photo';
import { Place } from '@/types/place';
import { placePath } from '@/utils/detail-paths';
import { formatNearbyDistance } from '@/utils/geo-utils';

const CARD_CLASS =
  'flex w-full min-w-0 items-center gap-3.5 rounded-xl bg-white py-2.5 pl-2.5 pr-3.5 text-left transition-shadow hover:shadow-md active:scale-[0.99]';

/**
 * A place in the nearby grid: a 72px photo beside its name and where it is -
 * the distance this rail is sorted by, or the city where that could not be
 * worked out. It opens in the drawer like the rails' cards, or links to the
 * place's page when there is no drawer above it.
 */
export const NearbyPlaceCard = ({ place, distanceKm }: { place: Place; distanceKm?: number }) => {
  const drawer = usePlaceDrawer();
  const locality =
    distanceKm !== undefined ? formatNearbyDistance(distanceKm) : placeLocality(place);

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
        {locality && (
          <span className="flex items-center gap-1 text-[12.5px] font-semibold text-ink-muted">
            <IconComponent
              iconName="Location01Icon"
              size={13}
              color="currentColor"
              className="flex-shrink-0"
            />
            {locality}
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
