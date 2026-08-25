'use client';

import { useCallback, useEffect, useRef } from 'react';

import { PhotoImage } from '@/app/shared/components/Images';
import { Moment, momentPhotos } from '@/types/moment';

interface MomentsMasonryProps {
  moments: Moment[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onLoadMore: () => void;
  hasMore: boolean;
  isLoadingMore: boolean;
  // Column count varies by the width the grid is given. Every variant starts
  // at one column: two half-width columns on a phone leave a moment's photo and
  // caption too narrow to read.
  columnsClassName?: string;
}

export const MomentsMasonry = ({
  moments,
  selectedId,
  onSelect,
  onLoadMore,
  hasMore,
  isLoadingMore,
  columnsClassName = 'columns-1 gap-4 sm:columns-2 md:columns-3',
}: MomentsMasonryProps) => {
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const loadMoreRef = useCallback(
    (node: HTMLDivElement | null) => {
      observerRef.current?.disconnect();
      sentinelRef.current = node;
      if (!node || !hasMore || isLoadingMore) return;

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
        {moments.map((moment) => {
          const media = momentPhotos(moment)[0];
          if (!media) return null;

          return (
            <button
              key={moment.id}
              type="button"
              onClick={() => onSelect(moment.id)}
              className={`mb-4 block w-full break-inside-avoid overflow-hidden rounded-2xl ${
                moment.id === selectedId ? 'ring-2 ring-primary' : ''
              }`}
            >
              <PhotoImage
                src={media.photo}
                alt={moment.title}
                // Real intrinsic dimensions, so each tile keeps its aspect ratio
                width={media.width || 400}
                height={media.height || 400}
                sizes="(max-width: 768px) 50vw, 300px"
                className="h-auto w-full object-cover"
              />
            </button>
          );
        })}
      </div>

      <div ref={loadMoreRef} className="h-8" />

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
