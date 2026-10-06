'use client';

import { useCallback, useEffect, useRef } from 'react';

import { PhotoImage } from '@/app/shared/components/Images';
import { Moment, momentPhotos } from '@/types/moment';

import { MomentCard } from './MomentCard';

interface MomentsMasonryProps {
  moments: Moment[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  // Paging is optional. Without onLoadMore there is no sentinel, so the caller
  // pages itself (the Moments feed uses a Show more button)
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  // Column count varies by the width the grid is given, starting at two on a
  // phone so the feed reads as a grid rather than a single stack.
  columnsClassName?: string;
  // Where this run starts in the whole feed, so the eager-load count holds
  // when the feed is split into several masonries around break rails
  startIndex?: number;
  // 'photo' is the bare photo tile the other masonries use. 'card' is the
  // moment card Discover uses, with its caption and byline.
  tile?: MomentsMasonryTile;
}

export type MomentsMasonryTile = 'photo' | 'card';

// Roughly the first screenful across the two- and three-column layouts
const EAGER_TILES = 6;

export const MomentsMasonry = ({
  moments,
  selectedId,
  onSelect,
  onLoadMore,
  hasMore = false,
  isLoadingMore = false,
  columnsClassName = 'columns-2 gap-4 md:columns-3',
  startIndex = 0,
  tile = 'photo',
}: MomentsMasonryProps) => {
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const loadMoreRef = useCallback(
    (node: HTMLDivElement | null) => {
      observerRef.current?.disconnect();
      sentinelRef.current = node;
      if (!node || !onLoadMore || !hasMore || isLoadingMore) return;

      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) onLoadMore();
        },
        { threshold: 0.1, rootMargin: '200px' },
      );
      observerRef.current.observe(node);
    },
    [hasMore, isLoadingMore, onLoadMore],
  );

  useEffect(() => () => observerRef.current?.disconnect(), []);

  return (
    <div>
      {/* CSS columns keep each tile at its natural height, which is what makes
          the layout masonry rather than a grid */}
      <div className={columnsClassName}>
        {moments.map((moment, index) => {
          const media = momentPhotos(moment)[0];
          if (!media) return null;

          // The tiles above the fold load without waiting for the lazy-load
          // observer, counted across every run of the feed
          const priority = startIndex + index < EAGER_TILES;

          if (tile === 'card') {
            return (
              // The column item is a plain div, not the card's button. WebKit does
              // not measure a `button` correctly as a multi-column child, which
              // left iOS Safari piling the tiles into the first column and leaving
              // the rest of the row blank.
              <div
                key={moment.id}
                className={`mb-4 break-inside-avoid rounded-2xl ${
                  moment.id === selectedId ? 'ring-2 ring-primary' : ''
                }`}
              >
                <MomentCard
                  moment={moment}
                  onClick={() => onSelect(moment.id)}
                  priority={priority}
                  className="w-full"
                />
              </div>
            );
          }

          return (
            // The column item is a plain div, not the button. WebKit does not
            // measure a `button` correctly as a multi-column child, which left
            // iOS Safari piling the tiles into the first column and leaving the
            // rest of the row blank.
            <div key={moment.id} className="mb-4 break-inside-avoid">
              <button
                type="button"
                onClick={() => onSelect(moment.id)}
                // Lifts under the cursor so it reads as openable. No entrance
                // animation: `animate-in fade-in` starts the tile at opacity 0,
                // so anywhere the animation does not run the photo never
                // appears at all - which is the other half of what broke here.
                className={`block w-full overflow-hidden rounded-2xl transition duration-300 hover:-translate-y-0.5 hover:shadow-md motion-reduce:transition-none motion-reduce:hover:translate-y-0 ${
                  moment.id === selectedId ? 'ring-2 ring-primary' : ''
                }`}
              >
                <PhotoImage
                  src={media.photo}
                  alt={moment.title}
                  // Real intrinsic dimensions, so each tile keeps its aspect
                  // ratio and holds its space before the photo arrives
                  width={media.width || 400}
                  height={media.height || 400}
                  sizes="(max-width: 768px) 50vw, 300px"
                  priority={priority}
                  // `block` so the image is not an inline box sitting on a text
                  // baseline, which adds a few stray pixels under every tile
                  className="block h-auto w-full object-cover"
                />
              </button>
            </div>
          );
        })}
      </div>

      {onLoadMore && <div ref={loadMoreRef} className="h-8" />}

      {isLoadingMore && (
        <div className={columnsClassName}>
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="mb-4 h-48 w-full animate-pulse break-inside-avoid rounded-2xl bg-gray-200"
            />
          ))}
        </div>
      )}
    </div>
  );
};
