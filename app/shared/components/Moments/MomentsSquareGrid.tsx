'use client';

import { IconComponent } from '@/app/shared/components/Icons';
import { PhotoImage } from '@/app/shared/components/Images';
import { Moment, momentPhotos } from '@/types/moment';

/**
 * Moments as a fixed three-column grid of square cells, for a narrow panel.
 *
 * The masonry above is for tiles that keep their own height. Here every cell is
 * the same square, and a moment with more than one photo says how many over its
 * corner - the masonry has no room for that badge at its tile sizes.
 */
export const MomentsSquareGrid = ({
  moments,
  onSelect,
}: {
  moments: Moment[];
  onSelect: (id: string) => void;
}) => (
  <div className="grid grid-cols-3 gap-1">
    {moments.map((moment) => {
      const photos = momentPhotos(moment);
      const cover = photos[0];
      if (!cover) return null;

      return (
        <button
          key={moment.id}
          type="button"
          onClick={() => onSelect(moment.id)}
          aria-label={moment.title}
          className="relative aspect-square overflow-hidden rounded-xl bg-surface"
        >
          <PhotoImage
            src={cover.photo}
            alt=""
            fill
            sizes="(max-width: 768px) 33vw, 200px"
            className="object-cover"
          />

          {photos.length > 1 && (
            <span className="pointer-events-none absolute right-1.5 top-1.5 inline-flex h-6 items-center gap-1 rounded-full bg-black/55 px-2 text-[11.5px] font-bold text-white">
              <IconComponent iconName="Copy01Icon" size={13} color="currentColor" />
              {photos.length}
            </span>
          )}
        </button>
      );
    })}
  </div>
);
