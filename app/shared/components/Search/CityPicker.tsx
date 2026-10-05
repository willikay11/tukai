'use client';

import { IconComponent } from '@/app/shared/components/Icons';
import { PhotoImage } from '@/app/shared/components/Images';
import { usePlaceCategories } from '@/app/shared/hooks/usePlaces';
import { Switch } from '@/components/ui/switch';
import { useLocation } from '@/context/LocationContext';
import { cn } from '@/lib/utils';
import { PlaceCategory, categoryImageOf } from '@/types/placeCategory';

/**
 * What the city button opens: the reader's own location, or a city.
 *
 * The two are alternatives, which is why they share one panel - turning the
 * location on supersedes whichever city was chosen, and choosing a city turns
 * it back off.
 */
export const CityPicker = ({ onClose }: { onClose: () => void }) => {
  const { city, area, status, isUsingLocation, setUsingLocation, setCity } = useLocation();
  const { data: response, isLoading } = usePlaceCategories({ pageSize: 50, group: 'cities' }, true);

  const cities: PlaceCategory[] = response?.data?.results ?? [];
  const isResolving = isUsingLocation && (status === 'loading' || (status === 'granted' && !area));

  // What the location row says underneath, which is the whole point of turning
  // it on: where the reader actually is
  const locationNote = () => {
    if (status === 'denied') return 'Your browser is blocking it. Allow location and try again.';
    if (status === 'unavailable') return 'This device cannot give a location.';
    if (isResolving) return 'Finding you…';
    if (isUsingLocation && area) return area;
    if (isUsingLocation && city) return city;

    return "See what's closest to you first";
  };

  return (
    <div className="flex w-[340px] max-w-[calc(100vw-2rem)] flex-col gap-2 p-2">
      <div className="flex items-center gap-3 rounded-xl bg-surface p-3">
        <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-white text-brand">
          <IconComponent iconName="Gps01Icon" size={20} color="currentColor" />
        </span>

        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="text-[14.5px] font-semibold text-gray-900">Use my location</span>
          <span
            className={cn(
              'text-[12.5px] leading-snug',
              isUsingLocation && area ? 'font-semibold text-brand' : 'text-ink-muted',
            )}
          >
            {locationNote()}
          </span>
        </span>

        <Switch
          checked={isUsingLocation}
          aria-label="Use my location"
          onCheckedChange={setUsingLocation}
        />
      </div>

      <p className="mx-2.5 text-xs leading-snug text-ink-muted">
        Only used to sort what&apos;s near you. Never shown to anyone.
      </p>

      <div className="mx-2.5 h-px bg-surface-muted" />

      <span className="px-2.5 text-[12.5px] font-semibold text-ink-muted">Choose a city</span>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-1">
          {[0, 1, 2, 3].map((row) => (
            <div key={row} className="h-11 animate-pulse rounded-full bg-surface" />
          ))}
        </div>
      ) : (
        <div className="grid max-h-[232px] grid-cols-2 gap-1 overflow-y-auto overscroll-contain pr-0.5">
          {cities.map((option) => {
            const isCurrent = !isUsingLocation && option.name === city;

            return (
              <button
                key={option.id}
                type="button"
                aria-pressed={isCurrent}
                onClick={() => {
                  // Choosing a city is the other half of the switch above
                  setUsingLocation(false);
                  setCity(option.name);
                  onClose();
                }}
                className={cn(
                  'flex min-h-11 items-center gap-2.5 rounded-full py-1.5 pl-1.5 pr-2.5 text-left text-sm font-semibold transition-colors',
                  isCurrent ? 'bg-surface-brand text-brand' : 'text-gray-900 hover:bg-surface',
                )}
              >
                <span className="relative h-[34px] w-[34px] flex-shrink-0 overflow-hidden rounded-full bg-surface">
                  <PhotoImage
                    src={categoryImageOf(option) ?? undefined}
                    alt=""
                    fill
                    sizes="34px"
                    className="object-cover"
                  />
                </span>

                <span className="min-w-0 flex-1 truncate">{option.name}</span>

                {isCurrent && (
                  <IconComponent
                    iconName="Tick02Icon"
                    size={16}
                    color="currentColor"
                    className="flex-shrink-0 text-brand"
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
