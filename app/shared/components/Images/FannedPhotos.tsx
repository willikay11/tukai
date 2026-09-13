import { cn } from '@/lib/utils';

import { PhotoImage } from './PhotoImage';

type FanSize = 'sm' | 'md';

// Overlap is tuned per size so the flanking photos sit the same proportional
// distance from the centre one. `space-x` applies margin-left to every child
// after the first, so a negative value pulls the pile together.
const FAN_SIZES: Record<
  FanSize,
  {
    overlap: string;
    centre: string;
    flank: string;
    centreSizes: string;
    flankSizes: string;
    centreIcon: number;
    flankIcon: number;
  }
> = {
  sm: {
    overlap: '-space-x-[11px]',
    centre: 'h-9 w-9 rounded-lg',
    flank: 'h-7 w-7 rounded-md',
    centreSizes: '36px',
    flankSizes: '28px',
    centreIcon: 16,
    flankIcon: 13,
  },
  md: {
    overlap: '-space-x-[22px]',
    centre: 'h-20 w-20 rounded-2xl',
    flank: 'h-14 w-14 rounded-xl',
    centreSizes: '80px',
    flankSizes: '56px',
    centreIcon: 28,
    flankIcon: 20,
  },
};

/**
 * Up to three photos fanned like a handful of prints: the first sits centred
 * and on top, the second and third tilt out behind it to the left and right.
 *
 * Fill order is centre → left → right, so two photos read as a pair leaning
 * left rather than leaving a hole on one side, and one photo is just a photo.
 * The row sizes itself to however many it gets, which lets callers anchor it
 * to an edge without an empty slot padding it out.
 */
export const FannedPhotos = ({
  photos,
  size = 'md',
  className,
}: {
  photos: (string | null | undefined)[];
  size?: FanSize;
  className?: string;
}) => {
  const [centre, left, right] = photos.filter(
    (photo): photo is string => typeof photo === 'string' && photo.length > 0,
  );

  if (!centre) return null;

  const style = FAN_SIZES[size];
  const tile = 'relative flex-shrink-0 overflow-hidden bg-gray-200 ring-2 ring-white';

  return (
    <div className={cn('flex items-center', style.overlap, className)}>
      {left && (
        <div className={cn(tile, style.flank, 'z-0 -rotate-12')}>
          <PhotoImage
            src={left}
            alt=""
            fill
            sizes={style.flankSizes}
            className="object-cover"
            fallbackIconSize={style.flankIcon}
          />
        </div>
      )}

      <div className={cn(tile, style.centre, 'z-10')}>
        <PhotoImage
          src={centre}
          alt=""
          fill
          sizes={style.centreSizes}
          className="object-cover"
          fallbackIconSize={style.centreIcon}
        />
      </div>

      {right && (
        <div className={cn(tile, style.flank, 'z-0 rotate-12')}>
          <PhotoImage
            src={right}
            alt=""
            fill
            sizes={style.flankSizes}
            className="object-cover"
            fallbackIconSize={style.flankIcon}
          />
        </div>
      )}
    </div>
  );
};
