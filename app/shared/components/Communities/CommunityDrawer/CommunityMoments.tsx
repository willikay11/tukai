'use client';

import { useState } from 'react';

import { useSession } from 'next-auth/react';

import { PhotoImage } from '@/app/shared/components/Images';
import { MomentDrawer } from '@/app/shared/components/Moments';
import { Moment, momentPhotos } from '@/types/moment';

import { MAX_MOSAIC_TILES, mosaicSpans } from './community-drawer';
import { Avatar, Divider } from './parts';
import { COMMUNITY_SECTIONS, SECTION_SCROLL_MARGIN } from './tabs';

/** Two stacked squares, the handoff's own album mark - Hugeicons has no match. */
const AlbumIcon = () => (
  <svg
    aria-hidden
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.9"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="8" y="8" width="13" height="13" rx="3" />
    <path d="M16 4H7a3 3 0 0 0-3 3v9" />
  </svg>
);

const tileLabel = (moment: Moment, photoCount: number) =>
  `Open moment${photoCount > 1 ? `, ${photoCount} photos` : ''}${
    moment.title ? `: ${moment.title}` : ''
  }`;

/**
 * Three square columns, 4px apart, with spans that depend on how many tiles
 * there are - the handoff's own table, not the page's 10-tile mosaic.
 */
const MomentsMosaic = ({
  moments,
  onSelect,
}: {
  moments: Moment[];
  onSelect: (moment: Moment) => void;
}) => {
  const tiles = moments
    .filter((moment) => momentPhotos(moment).length > 0)
    .slice(0, MAX_MOSAIC_TILES);
  const spans = mosaicSpans(tiles.length);

  return (
    // Square cells need the grid's own width, which only a container query
    // unit can give a CSS row height
    <div className="-mt-3 [container-type:inline-size]">
      <div
        className="grid grid-cols-3 gap-1 [grid-auto-flow:dense]"
        style={{ gridAutoRows: 'calc((100cqw - 8px) / 3)' }}
      >
        {tiles.map((moment, index) => {
          const photos = momentPhotos(moment);
          const [columns, rows] = spans[index] ?? [1, 1];

          return (
            <button
              key={moment.id}
              type="button"
              onClick={() => onSelect(moment)}
              aria-label={tileLabel(moment, photos.length)}
              className="relative overflow-hidden rounded-xl bg-surface"
              style={{ gridColumn: `span ${columns}`, gridRow: `span ${rows}` }}
            >
              <PhotoImage
                src={photos[0].photo}
                alt=""
                fill
                sizes="(max-width: 720px) 66vw, 420px"
                className="object-cover"
              />
              {photos.length > 1 && (
                <span className="pointer-events-none absolute right-1.5 top-1.5 inline-flex h-6 items-center gap-1 rounded-full bg-black/55 px-2 text-[11.5px] font-bold text-white">
                  <AlbumIcon />
                  {photos.length}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

/**
 * "Moments from {community}": a composer row, then the mosaic. The row opens
 * the composer for members and owners; for anyone else it says joining comes
 * first. Tiles open the moment on top of the community.
 */
export const CommunityMoments = ({
  communityTitle,
  moments,
  isLoading,
  onCompose,
}: {
  communityTitle: string;
  moments: Moment[];
  isLoading: boolean;
  /** Members open the composer; everyone else gets the drawer's "join first" message. */
  onCompose: () => void;
}) => {
  const { data: session } = useSession();
  const [openMoment, setOpenMoment] = useState<Moment | null>(null);
  const name = session?.user?.name ?? 'You';
  const hasTiles = moments.some((moment) => momentPhotos(moment).length > 0);

  return (
    <section
      id={COMMUNITY_SECTIONS.moments}
      className={SECTION_SCROLL_MARGIN}
      aria-labelledby="community-moments-title"
    >
      <div className="flex flex-col gap-3.5">
        <h3
          id="community-moments-title"
          className="text-19 font-bold tracking-[-0.2px] text-gray-800"
        >
          Moments from {communityTitle}
        </h3>

        <button
          type="button"
          onClick={onCompose}
          aria-label={`Share a moment from ${communityTitle}`}
          className="-mx-6 flex cursor-text items-center gap-3.5 border-b border-surface-muted px-6 pb-4 pt-1 text-left"
        >
          <Avatar src={session?.user?.image} name={name} size={48} />
          <span className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="truncate text-[15px] font-semibold text-gray-800">{name}</span>
            <span className="text-[14.5px] text-ink-muted">What are you up to?</span>
          </span>
        </button>

        {isLoading ? (
          <div className="-mt-3 grid grid-cols-3 gap-1">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="aspect-square animate-pulse rounded-xl bg-surface" />
            ))}
          </div>
        ) : hasTiles ? (
          <MomentsMosaic moments={moments} onSelect={setOpenMoment} />
        ) : (
          <p className="-mt-2 text-sm leading-normal text-ink-muted [text-wrap:pretty]">
            No moments from {communityTitle} yet. Yours could be the first.
          </p>
        )}
      </div>

      {/* A divider follows the mosaic, not the empty line */}
      {hasTiles && (
        <div className="mt-7">
          <Divider />
        </div>
      )}

      <MomentDrawer moment={openMoment} onClose={() => setOpenMoment(null)} />
    </section>
  );
};
