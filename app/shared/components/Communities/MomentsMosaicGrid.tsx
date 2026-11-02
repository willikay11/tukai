'use client';

import { IconComponent } from '@/app/shared/components/Icons';
import { PhotoImage } from '@/app/shared/components/Images';
import { Moment, momentPhotos } from '@/types/moment';

/**
 * Column x row spans, in order - the Communities handoff's dense mosaic
 * rather than the masonry other drawers use, so the tiles vary in size and
 * the dense flow fills the gaps between them.
 */
const SPANS: Array<[number, number]> = [
  [1, 1],
  [2, 1],
  [1, 2],
  [2, 2],
  [1, 1],
  [1, 1],
  [1, 1],
  [2, 1],
  [1, 1],
  [1, 1],
];

const MAX_TILES = SPANS.length;

/**
 * The 10-tile dense mosaic the Communities handoff's "Moments" block uses, on
 * the page and in the drawer alike: a fixed sequence of spans over
 * `grid-auto-flow: dense`, rather than a column-based masonry.
 */
export const MomentsMosaicGrid = ({
  moments,
  onSelect,
}: {
  moments: Moment[];
  onSelect: (id: string) => void;
}) => (
  <div
    className="grid gap-1.5"
    style={{
      gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
      gridAutoRows: '170px',
      gridAutoFlow: 'dense',
    }}
  >
    {moments.slice(0, MAX_TILES).map((moment, index) => {
      const photos = momentPhotos(moment);
      const cover = photos[0];
      if (!cover) return null;

      const [columns, rows] = SPANS[index] ?? [1, 1];

      return (
        <button
          key={moment.id}
          type="button"
          onClick={() => onSelect(moment.id)}
          aria-label={moment.title}
          className="group relative min-w-0 overflow-hidden rounded-xl bg-surface"
          style={{ gridColumn: `span ${columns}`, gridRow: `span ${rows}` }}
        >
          <PhotoImage
            src={cover.photo}
            alt=""
            fill
            sizes="(max-width: 768px) 50vw, 300px"
            className="object-cover transition-transform duration-[450ms] ease-out group-hover:scale-[1.04]"
          />

          {photos.length > 1 && (
            <span className="pointer-events-none absolute right-2 top-2 inline-flex h-6 items-center gap-1 rounded-full bg-black/55 px-2 text-[11.5px] font-bold text-white">
              <IconComponent iconName="Copy01Icon" size={13} color="currentColor" />
              {photos.length}
            </span>
          )}
        </button>
      );
    })}
  </div>
);
