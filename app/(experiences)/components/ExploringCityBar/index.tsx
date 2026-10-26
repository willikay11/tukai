'use client';

import { IconComponent } from '@/app/shared/components/Icons';
import { PhotoImage } from '@/app/shared/components/Images';
import { usePlaceCategories } from '@/app/shared/hooks/usePlaces';
import { useLocation } from '@/context/LocationContext';
import { PlaceCategory, categoryImageOf } from '@/types/placeCategory';

/**
 * Discover's own banner while showing a city other than home: says so, and
 * offers the way back to the chip's own popover.
 *
 * "Change city" has no popover of its own - the chip already has one, tagged
 * with `data-city-root` in {@link SearchBarShell}, so this just finds whichever
 * copy of it is actually on screen (mobile or desktop) and opens that.
 */
export const ExploringCityBar = () => {
  const { away, city, homeCity } = useLocation();
  const { data: response } = usePlaceCategories({ pageSize: 50, group: 'cities' }, away);

  if (!away || !city) return null;

  const cities: PlaceCategory[] = response?.data?.results ?? [];
  const cityOption = cities.find((option) => option.name === city);
  const photo = cityOption ? categoryImageOf(cityOption) : null;

  const openCityPicker = () => {
    const triggers = document.querySelectorAll<HTMLElement>(
      '[data-city-root] [aria-haspopup="dialog"]',
    );
    const visible = Array.from(triggers).find((trigger) => trigger.offsetParent !== null);
    visible?.click();
  };

  return (
    <div role="status" className="flex flex-wrap items-end gap-x-4 gap-y-3">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <span className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-full bg-white">
          <PhotoImage src={photo ?? undefined} alt="" fill sizes="48px" className="object-cover" />
        </span>

        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="text-base font-bold leading-tight text-brand-ink">Exploring {city}</span>
          <span className="text-[13px] leading-snug text-[#3C4A45]">
            Showing experiences, places and communities in {city}. Your city is {homeCity}.
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={openCityPicker}
        className="-mb-2.5 flex h-11 flex-shrink-0 items-center gap-2 whitespace-nowrap rounded-full pl-[14px] pr-4 text-sm font-semibold text-brand transition-colors hover:bg-surface"
      >
        <IconComponent iconName="Location01Icon" size={18} color="currentColor" />
        Change city
      </button>
    </div>
  );
};
