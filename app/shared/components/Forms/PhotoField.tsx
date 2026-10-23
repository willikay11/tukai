'use client';

import { useRef, useState } from 'react';

import { IconComponent } from '@/app/shared/components/Icons';
import { cn } from '@/lib/utils';

const MAX_PHOTOS = 6;

export interface PhotoFieldPhoto {
  id: string;
  url: string;
}

interface PhotoFieldProps {
  photos: PhotoFieldPhoto[];
  onAdd: (files: File[]) => void;
  onRemove: (id: string) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
  onMove: (id: string, direction: -1 | 1) => void;
  // A place's photos (and some other callers) have no designated lead image,
  // unlike a community or experience poster.
  showCoverBadge?: boolean;
  label?: React.ReactNode;
  maxPhotos?: number;
}

/**
 * The photo uploader shared by every "poster" field across the drawers
 * (Create community, Create experience's About step, the place-claim form):
 * up to `maxPhotos` photos, first is the cover. Hold-and-drag reorders on a
 * pointer; the arrow keys do the same for anyone focused on a tile with a
 * keyboard, per the canvas's own accessibility note.
 */
export const PhotoField = ({
  photos,
  onAdd,
  onRemove,
  onReorder,
  onMove,
  showCoverBadge = true,
  label,
  maxPhotos = MAX_PHOTOS,
}: PhotoFieldProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const hasReachedMax = photos.length >= maxPhotos;

  return (
    <div className="flex flex-col gap-3">
      {label && <span className="text-[15px] font-semibold text-gray-800">{label}</span>}

      <div className="flex flex-wrap gap-2.5" role="group" aria-label="Photos">
        {photos.map((photo, index) => {
          const isDragging = draggedIndex === index;

          return (
            <span
              key={photo.id}
              tabIndex={0}
              aria-label={`Photo ${index + 1} of ${photos.length}${
                index === 0 && showCoverBadge ? ', cover' : ''
              }. Drag, or use the arrow keys, to reorder.`}
              draggable
              onDragStart={() => setDraggedIndex(index)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => {
                if (draggedIndex !== null) onReorder(draggedIndex, index);
                setDraggedIndex(null);
              }}
              onDragEnd={() => setDraggedIndex(null)}
              onKeyDown={(event) => {
                if (event.key === 'ArrowLeft') {
                  event.preventDefault();
                  onMove(photo.id, -1);
                } else if (event.key === 'ArrowRight') {
                  event.preventDefault();
                  onMove(photo.id, 1);
                }
              }}
              className={cn(
                'relative z-[1] block h-[140px] w-[140px] cursor-grab touch-none select-none rounded-xl transition-shadow',
                isDragging && 'z-[3] cursor-grabbing shadow-[0_14px_30px_rgba(1,51,52,.28)]',
              )}
            >
              <span className="absolute inset-0 overflow-hidden rounded-xl bg-surface">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.url}
                  alt=""
                  draggable={false}
                  className="pointer-events-none block h-full w-full object-cover"
                />
              </span>

              {showCoverBadge && index === 0 && (
                <span className="pointer-events-none absolute bottom-2 left-2 inline-flex h-[22px] items-center rounded-full bg-black/60 px-2 text-[11.5px] font-bold text-white backdrop-blur-[6px]">
                  Cover
                </span>
              )}

              <button
                type="button"
                onClick={() => onRemove(photo.id)}
                aria-label={`Remove photo ${index + 1}`}
                className="absolute right-0 top-0 flex h-11 w-11 items-center justify-center border-none bg-transparent"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[rgba(1,51,52,.72)] text-white">
                  <IconComponent iconName="Cancel01Icon" size={16} color="currentColor" />
                </span>
              </button>
            </span>
          );
        })}

        {!hasReachedMax && (
          <label className="relative flex h-[140px] w-[140px] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-[1.5px] border-dashed border-brand-mid bg-[#EEFBF4] text-center text-[14.5px] text-gray-800 transition-colors hover:bg-[#E3F7EC]">
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple
              aria-label="Add photos"
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              onChange={(event) => {
                const files = event.target.files ? Array.from(event.target.files) : [];
                onAdd(files);
                event.target.value = '';
              }}
            />
            <IconComponent iconName="ImageAdd02Icon" size={26} color="#066349" />
            Add photo(s)
          </label>
        )}
      </div>

      {photos.length > 1 && (
        <span className="text-13 leading-tight text-ink-muted">
          Hold and drag to reorder. The first photo is the cover.
        </span>
      )}
    </div>
  );
};
