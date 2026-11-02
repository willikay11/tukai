'use client';

import { DescriptionShowMore } from '@/app/shared/components/Global';
import { IconComponent } from '@/app/shared/components/Icons';
import { PhotoImage } from '@/app/shared/components/Images';
import { useRailPaging } from '@/app/shared/components/Lists';
import { cn } from '@/lib/utils';
import { Community } from '@/types/community';

import { PHOTO_WIDTHS, cityOf } from './community-drawer';
import { COMMUNITY_SECTIONS, SECTION_SCROLL_MARGIN } from './tabs';

/** The handoff's "Show more" threshold on the About text. */
const ABOUT_MAX_LENGTH = 180;

const PhotoArrow = ({
  direction,
  onClick,
}: {
  direction: 'left' | 'right';
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={`Scroll photos ${direction}`}
    className={cn(
      'absolute top-1/2 z-[2] flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-brand-ink shadow-[0_4px_14px_rgba(1,51,52,.25)] hover:bg-white active:scale-[0.94]',
      direction === 'left' ? 'left-3.5' : 'right-3.5',
    )}
  >
    <IconComponent
      iconName={direction === 'left' ? 'ArrowLeft01Icon' : 'ArrowRight01Icon'}
      size={20}
      color="currentColor"
    />
  </button>
);

/**
 * The row of photos at one height, each at the handoff's own width in turn.
 *
 * ⚠️ Not buttons: the handoff opens a photo viewer on tap, and the app has no
 * photo viewer to open yet.
 */
const PhotoRow = ({ photos, title }: { photos: string[]; title: string }) => {
  const { ref, atStart, atEnd, onBack, onNext } = useRailPaging<HTMLDivElement>();

  if (photos.length === 0) return null;

  return (
    <div className="relative -mx-6">
      <div
        ref={ref}
        className="flex snap-x snap-proximity scroll-px-6 gap-2 overflow-x-auto px-6 scrollbar-hide"
      >
        {photos.map((photo, index) => (
          <div
            key={photo}
            className="relative h-[240px] flex-none snap-start overflow-hidden rounded-xl bg-surface"
            style={{ width: PHOTO_WIDTHS[index] }}
          >
            <PhotoImage
              src={photo}
              alt={`Photo ${index + 1} of ${photos.length} of ${title}`}
              fill
              sizes={`${PHOTO_WIDTHS[index]}px`}
              priority={index === 0}
              className="object-cover"
            />
          </div>
        ))}
      </div>

      {!atStart && <PhotoArrow direction="left" onClick={onBack} />}
      {!atEnd && <PhotoArrow direction="right" onClick={onNext} />}
    </div>
  );
};

/**
 * Photos, the city and business chips and the About text - the handoff's
 * blocks 2 to 4, which sit back to back with tighter gaps than the rest.
 */
export const CommunityAboutSection = ({
  community,
  photos,
  onShowPlaces,
}: {
  community: Community;
  photos: string[];
  /** The business chip jumps to Places, the same as the tab does. */
  onShowPlaces: () => void;
}) => {
  const city = cityOf(community);
  const placeCount = community.verifiedPlaces?.length ?? 0;
  const isBusiness = Boolean(community.verified) && placeCount > 0;
  const placesLabel = `${placeCount} ${placeCount === 1 ? 'place' : 'places'}`;

  return (
    <>
      <PhotoRow photos={photos} title={community.title} />

      {(city || isBusiness) && (
        <div className="-mt-3 flex flex-wrap items-center gap-2">
          {city && (
            <span className="inline-flex h-11 items-center gap-2 whitespace-nowrap rounded-full border border-line-soft bg-surface-muted pl-3 pr-4 text-[14.5px] text-ink">
              <IconComponent
                iconName="Building03Icon"
                size={19}
                color="currentColor"
                className="text-brand"
              />
              {city}, Kenya
            </span>
          )}

          {isBusiness && (
            <button
              type="button"
              onClick={onShowPlaces}
              aria-label={`Verified business, owns ${placesLabel}. Show places`}
              className="inline-flex h-11 items-center gap-2 whitespace-nowrap rounded-full bg-surface-brand pl-3 pr-4 text-[14.5px] text-brand-ink transition-colors hover:bg-surface-tab"
            >
              <IconComponent
                iconName="CheckmarkCircle02Icon"
                size={19}
                color="currentColor"
                className="text-brand"
              />
              Verified business
              <span aria-hidden className="h-[5px] w-[5px] rounded-full bg-distance" />
              {placesLabel}
            </button>
          )}
        </div>
      )}

      <section
        id={COMMUNITY_SECTIONS.about}
        className={cn('-mt-3.5 text-[15px] leading-[1.6] text-gray-800', SECTION_SCROLL_MARGIN)}
      >
        <DescriptionShowMore text={community.description} maxLength={ABOUT_MAX_LENGTH} />
      </section>
    </>
  );
};
