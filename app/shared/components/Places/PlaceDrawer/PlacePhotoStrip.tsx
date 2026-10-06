'use client';

import { IconComponent } from '@/app/shared/components/Icons';
import { PhotoImage } from '@/app/shared/components/Images';
import { useRailPaging } from '@/app/shared/components/Lists';
import { cn } from '@/lib/utils';

/** The design's row height. Each photo keeps its own width at it. */
const STRIP_HEIGHT = 240;

/**
 * Stands in for the real width until the photo loads and the browser swaps in
 * its own ratio. Landscape, because most place photos are.
 */
const ASSUMED_WIDTH = 320;

const Arrow = ({
  direction,
  disabled,
  onClick,
}: {
  direction: 'back' | 'next';
  disabled: boolean;
  onClick: () => void;
}) => {
  if (disabled) return null;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={direction === 'back' ? 'Previous photos' : 'More photos'}
      className={cn(
        'absolute top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-brand-ink shadow-[0_4px_14px_rgba(1,51,52,.25)] transition-transform hover:bg-white active:scale-[0.94]',
        direction === 'back' ? 'left-3.5' : 'right-3.5',
      )}
    >
      <IconComponent
        iconName={direction === 'back' ? 'ArrowLeft01Icon' : 'ArrowRight01Icon'}
        size={20}
        color="currentColor"
      />
    </button>
  );
};

/**
 * The drawer's photos: a row at one height, each keeping its own width, that
 * the reader scrolls through.
 *
 * Not SquarePhotoStrip: its `hero` variant is a full-width 4:3 carousel with
 * dots and its `strip` variant crops every photo square. This design does
 * neither - a wide room and a tall doorway both read as themselves.
 *
 * ⚠️ The API sends no dimensions with a photo, so each one is laid out at an
 * assumed width and takes its real ratio once it loads. Fixing that properly
 * means `width` and `height` on the photo serializer.
 */
export const PlacePhotoStrip = ({ photos, alt }: { photos: string[]; alt: string }) => {
  const { ref, atStart, atEnd, onBack, onNext } = useRailPaging<HTMLDivElement>();

  if (photos.length === 0) return null;

  return (
    <div className="relative">
      <div
        ref={ref}
        className="flex snap-x gap-2 overflow-x-auto scrollbar-hide"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {photos.map((photo, index) => (
          <div
            key={photo}
            className="relative flex-shrink-0 snap-start overflow-hidden rounded-xl bg-surface"
            style={{ height: STRIP_HEIGHT }}
          >
            <PhotoImage
              src={photo}
              alt={`${alt} photo ${index + 1}`}
              width={ASSUMED_WIDTH}
              height={STRIP_HEIGHT}
              sizes="480px"
              priority={index === 0}
              className="h-[240px] w-auto object-cover"
            />
          </div>
        ))}
      </div>

      <Arrow direction="back" disabled={atStart} onClick={onBack} />
      <Arrow direction="next" disabled={atEnd} onClick={onNext} />
    </div>
  );
};
