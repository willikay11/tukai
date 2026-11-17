'use client';

import Link from 'next/link';

import { SectionHeader } from '@/app/(experiences)/experiences/components/SectionHeader';
import { PhotoImage } from '@/app/shared/components/Images';
import { useRailPaging } from '@/app/shared/components/Lists';
import { momentLabel } from '@/app/shared/components/Moments';
import { MEDIA_ZOOM } from '@/app/shared/components/Motion';
import { cn } from '@/lib/utils';
import { Moment, momentPhotos } from '@/types/moment';

import { RailTile, railColumns, railStep, stackPhotos } from './recent-moments';

const TITLE = 'Recent moments';
const SUBTITLE = 'Proof it happened, shared by the people who were there';

/** Columns in view on a laptop; their photos skip the lazy-load observer. */
const EAGER_COLUMNS = 4;

const FOCUS_RING =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2';

/**
 * The track. Its 12px of padding gives the See all card's hover shadow room
 * inside the scroll box, and the negative margins take that room back out, so
 * the tiles sit 18px under the header as the design has it.
 */
const TRACK =
  '-mb-3 -mt-2.5 flex snap-x snap-mandatory gap-[5px] overflow-x-auto overscroll-x-contain px-0.5 py-3 scrollbar-hide';

const COLUMN = 'flex h-[220px] min-w-0 flex-[0_0_130px] snap-start flex-col gap-[5px]';

/** Two stacked rounded squares: the canvas's own album glyph. */
const AlbumIcon = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.9"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    className="block flex-shrink-0"
  >
    <rect x="8" y="8" width="13" height="13" rx="3" />
    <path d="M16 4H7a3 3 0 0 0-3 3v9" />
  </svg>
);

const Tile = ({
  tile,
  priority,
  label,
  onOpen,
}: {
  tile: RailTile;
  priority: boolean;
  label: string;
  onOpen: (moment: Moment) => void;
}) => {
  const photos = momentPhotos(tile.moment);

  return (
    <button
      type="button"
      onClick={() => onOpen(tile.moment)}
      aria-label={label}
      className={cn(
        'group relative block min-h-0 w-full shrink basis-0 overflow-hidden rounded-xl bg-surface',
        tile.grow === 2 ? 'grow-[2]' : 'grow-[3]',
        FOCUS_RING,
      )}
    >
      <PhotoImage
        src={photos[0]?.photo}
        alt=""
        fill
        sizes="130px"
        priority={priority}
        className={cn('object-cover', MEDIA_ZOOM)}
      />

      {/* The rail shows an album's first photo only, so the count says there
          is more behind it */}
      {photos.length > 1 && (
        <span className="pointer-events-none absolute right-1.5 top-1.5 inline-flex h-6 items-center gap-1 rounded-full bg-black/55 px-2 text-[11.5px] font-bold text-white">
          <AlbumIcon />
          {photos.length}
        </span>
      )}
    </button>
  );
};

/** One of the See all card's three photos. */
const StackPhoto = ({ src, className }: { src: string | null; className: string }) => (
  <span className={cn('overflow-hidden bg-surface', className)}>
    <PhotoImage src={src} alt="" fill sizes="50px" className="object-cover" />
  </span>
);

const SeeAllMoments = ({ photos }: { photos: (string | null)[] }) => {
  const [left, centre, right] = photos;

  return (
    // A link rather than a tab switch: the Moments tab is its own route here,
    // so the reader lands at its top - the canvas's tab switch left them
    // partway down it
    <Link
      href="/moments"
      aria-label="See all moments"
      className={cn(
        'flex h-[220px] flex-[0_0_130px] snap-start flex-col items-center justify-center gap-4 rounded-xl border border-surface-muted bg-white transition-shadow hover:shadow-[0_8px_26px_rgba(1,51,52,.09)] active:scale-[0.98]',
        FOCUS_RING,
      )}
    >
      <span className="relative flex h-[68px] w-[104px] items-center justify-center">
        <StackPhoto
          src={left}
          className="absolute left-0 top-3 h-[42px] w-[42px] -rotate-[14deg] rounded-[10px] shadow-[0_4px_12px_rgba(1,51,52,.16)]"
        />
        <StackPhoto
          src={right}
          className="absolute right-0 top-3 h-[42px] w-[42px] rotate-[14deg] rounded-[10px] shadow-[0_4px_12px_rgba(1,51,52,.16)]"
        />
        <StackPhoto
          src={centre}
          className="relative h-[50px] w-[50px] rounded-xl shadow-[0_6px_18px_rgba(1,51,52,.22)]"
        />
      </span>

      <span className="text-[15px] font-bold text-brand">See all</span>
    </Link>
  );
};

/** Twelve columns of grey in the rail's own zigzag, so nothing jumps on arrival. */
export const RecentMomentsRailSkeleton = () => (
  <section aria-hidden="true">
    <SectionHeader title={TITLE} subtitle={SUBTITLE} />
    <div className={TRACK}>
      {Array.from({ length: 12 }, (_, column) => (
        <div key={column} className={COLUMN}>
          <div
            className={cn(
              'animate-pulse rounded-xl bg-gray-200',
              column % 2 === 0 ? 'grow-[2]' : 'grow-[3]',
            )}
          />
          <div
            className={cn(
              'animate-pulse rounded-xl bg-gray-200',
              column % 2 === 0 ? 'grow-[3]' : 'grow-[2]',
            )}
          />
        </div>
      ))}
    </div>
  </section>
);

/**
 * Discover's Recent moments: a sideways photo collage of columns, two moments
 * each with the tall tile swapping ends, closed by a See all card that leads
 * to the Moments tab.
 *
 * Shows nothing with fewer than two moments - one would be a half-empty
 * column. A tile opens its moment through `onOpen`.
 */
export const RecentMomentsRail = ({
  moments,
  onOpen,
}: {
  moments: Moment[];
  onOpen: (moment: Moment) => void;
}) => {
  const { ref, atStart, atEnd } = useRailPaging<HTMLDivElement>();

  const columns = railColumns(moments);
  if (columns.length === 0) return null;

  // Whole columns at a time, so a column is never left cut in half at the
  // left edge after a click
  const page = (direction: 1 | -1) => {
    const rail = ref.current;
    if (!rail) return;
    rail.scrollBy({ left: direction * railStep(rail.clientWidth), behavior: 'smooth' });
  };

  // Arrows that can never do anything are left out, as on every other rail
  const canScroll = !(atStart && atEnd);

  return (
    <section>
      <SectionHeader
        title={TITLE}
        subtitle={SUBTITLE}
        railLabel="moments"
        onBack={canScroll ? () => page(-1) : undefined}
        onNext={canScroll ? () => page(1) : undefined}
        atStart={atStart}
        atEnd={atEnd}
      />

      <div ref={ref} className={TRACK}>
        {columns.map((column, index) => (
          <div key={column[0].moment.id} className={COLUMN}>
            {column.map((tile) => (
              <Tile
                key={tile.moment.id}
                tile={tile}
                priority={index < EAGER_COLUMNS}
                label={momentLabel(tile.moment)}
                onOpen={onOpen}
              />
            ))}
          </div>
        ))}

        <SeeAllMoments photos={stackPhotos(moments, columns.length)} />
      </div>
    </section>
  );
};
