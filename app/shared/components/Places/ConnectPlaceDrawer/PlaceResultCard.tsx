'use client';

import { IconComponent } from '@/app/shared/components/Icons';
import { PhotoImage } from '@/app/shared/components/Images';
import { cn } from '@/lib/utils';
import { Place } from '@/types/place';

export type PlaceCardLockReason = 'inClaim' | null;

export const PlaceResultCard = ({
  place,
  isConnected,
  lockReason,
  onToggle,
}: {
  place: Place;
  isConnected: boolean;
  // "Yours" / "Claimed by {community}" need per-place ownership data the
  // search endpoint doesn't return, so only this session's own mock claims
  // (see ConnectPlaceDrawerContext) are reflected as locked here.
  lockReason: PlaceCardLockReason;
  onToggle: (place: Place) => void;
}) => {
  const isLocked = Boolean(lockReason);
  const cover = place.photos?.find((photo) => photo.isCover)?.photo ?? place.photos?.[0]?.photo;

  const pillIcon = isLocked ? 'SquareLock01Icon' : isConnected ? 'Tick02Icon' : 'Link01Icon';
  const pillLabel = isLocked ? 'In a claim' : isConnected ? 'Connected' : 'Connect';

  return (
    <button
      type="button"
      disabled={isLocked}
      aria-pressed={isConnected}
      aria-label={isConnected ? `Disconnect ${place.title}` : `Connect ${place.title}`}
      onClick={() => !isLocked && onToggle(place)}
      className={cn(
        'flex min-w-0 flex-col gap-2 border-none bg-transparent text-left',
        isLocked ? 'cursor-default opacity-70' : 'cursor-pointer',
      )}
    >
      <span className="relative block aspect-square w-full overflow-hidden rounded-xl bg-surface-brand">
        <PhotoImage src={cover} alt="" fill className="object-cover" fallbackIconSize={18} />

        <span
          className={cn(
            'absolute left-2 top-2 inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-[13.5px] font-semibold',
            isConnected ? 'bg-surface-brand text-brand' : 'bg-white/90 text-brand-ink',
            isLocked && 'text-ink-muted',
          )}
        >
          <IconComponent iconName={pillIcon} size={15} color="currentColor" />
          {pillLabel}
        </span>

        {place.totalReviews !== null && place.totalReviews > 0 && (
          <span className="absolute bottom-2 left-2 inline-flex h-[26px] items-center gap-1 rounded-full bg-[rgba(1,51,52,.72)] px-2.5 text-[12.5px] font-semibold text-white">
            <IconComponent iconName="StarIcon" variant="bulk" size={13} color="#F2C14B" />
            {place.averageRating.toFixed(1)}
          </span>
        )}
      </span>

      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="line-clamp-2 text-[14.5px] font-semibold leading-tight text-gray-800">
          {place.title}
        </span>
        {place.location?.city && (
          <span className="text-13 text-ink-muted">{place.location.city}</span>
        )}
      </span>
    </button>
  );
};
