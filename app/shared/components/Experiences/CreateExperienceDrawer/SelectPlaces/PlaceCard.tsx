'use client';

import { IconComponent } from '@/app/shared/components/Icons';
import { coverPhotoUrl } from '@/types/photo';
import type { Place } from '@/types/place';

interface PlaceCardProps {
  place: Place;
  isSelected: boolean;
  onToggle: () => void;
  /** "Add"/"Added" in multi-select mode, "Select"/"Selected" in single-pick. */
  actionLabels: { default: string; selected: string };
}

/**
 * tk-place-card - one Tukai place in the Select-places grid: a square photo
 * with a selection ring + pill overlay, a rating badge when the place has
 * one, and a name/category-area sub-line below.
 */
export const PlaceCard = ({ place, isSelected, onToggle, actionLabels }: PlaceCardProps) => {
  const subLine = [place.categories?.[0]?.name, place.location?.city].filter(Boolean).join(' · ');

  return (
    <button
      type="button"
      aria-pressed={isSelected}
      aria-label={`${isSelected ? actionLabels.selected : actionLabels.default} ${place.title}`}
      onClick={onToggle}
      className="flex min-w-0 flex-col gap-2.5 text-left active:scale-[0.99]"
    >
      <span className="relative block aspect-square w-full overflow-hidden rounded-xl bg-surface-brand">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={coverPhotoUrl(place.photos)} alt="" className="block h-full w-full object-cover" />

        <span
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 rounded-xl ${
            isSelected ? 'shadow-[inset_0_0_0_3px_#066349]' : ''
          }`}
        />

        <span
          className={`absolute right-2.5 top-2.5 inline-flex h-9 items-center gap-1.5 rounded-full pl-2.5 pr-3.5 text-14 font-semibold shadow-[0_2px_8px_rgba(1,51,52,.2)] ${
            isSelected ? 'bg-brand-ink text-white' : 'bg-white text-brand-ink'
          }`}
        >
          <IconComponent
            iconName={isSelected ? 'Tick02Icon' : 'AddCircleIcon'}
            size={18}
            color="currentColor"
          />
          {isSelected ? actionLabels.selected : actionLabels.default}
        </span>

        {place.averageRating > 0 && (
          <span className="absolute bottom-2.5 left-2.5 inline-flex h-7 items-center gap-1.5 rounded-full bg-[rgba(1,51,52,.72)] pl-2 pr-2.5 text-[13.5px] font-semibold text-white">
            <span className="text-amber-400">
              <IconComponent iconName="StarIcon" size={15} color="currentColor" variant="bulk" />
            </span>
            {place.averageRating.toFixed(1)}
          </span>
        )}
      </span>

      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="text-[15.5px] font-semibold leading-tight text-gray-800">
          {place.title}
        </span>
        {subLine && <span className="truncate text-[13.5px] text-ink-muted">{subLine}</span>}
      </span>
    </button>
  );
};
