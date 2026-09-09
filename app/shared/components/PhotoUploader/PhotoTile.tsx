'use client';

import Image from 'next/image';

import { IconComponent } from '@/app/shared/components/Icons';
import { cn } from '@/lib/utils';

import type { FormPhoto } from './index';

/** Poster is the experience's 155×105; square is a place's gallery cell. */
export type PhotoTileShape = 'poster' | 'square';

export const TILE_SHAPE_CLASSES: Record<PhotoTileShape, string> = {
  poster: 'h-[105px] w-[155px] rounded-lg',
  square: 'aspect-square w-full rounded-2xl',
};

const isExternalUrl = (src: string) => src.startsWith('https://') || src.startsWith('http://');

/**
 * One photo in the grid.
 *
 * Split out from the sortable wrapper so a grid that cannot be reordered — a
 * place's, where the API offers no way to persist an order — renders the same
 * tile without a drag context around it.
 */
export const PhotoTile = ({
  photo,
  index,
  shape = 'poster',
  isCover,
  isDeletingPhoto,
  getBlobUrl,
  onRemove,
  children,
}: {
  photo: FormPhoto;
  index: number;
  shape?: PhotoTileShape;
  isCover: boolean;
  isDeletingPhoto: boolean;
  getBlobUrl: (file: File) => string;
  onRemove: (index: number) => void;
  /** The drag affordance, when there is one */
  children?: React.ReactNode;
}) => {
  const src = photo.file ? getBlobUrl(photo.file) : photo.url;

  return (
    <>
      {children}

      {isCover && (
        <div
          className={cn(
            'absolute z-10 font-medium text-white',
            shape === 'square'
              ? 'bottom-2 left-2 flex items-center gap-1 rounded-lg bg-primary px-2 py-1 text-xs'
              : 'bottom-1 left-1 rounded bg-black/50 px-1.5 py-0.5 text-[10px]',
          )}
        >
          {shape === 'square' && (
            <IconComponent iconName="StarIcon" color="currentColor" size={12} />
          )}
          Cover
        </div>
      )}

      {isExternalUrl(photo.url) ? (
        <Image
          src={photo.url}
          alt={`Photo ${index + 1}`}
          fill
          sizes={shape === 'square' ? '240px' : '155px'}
          className="object-cover"
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={`Photo ${index + 1}`} className="h-full w-full object-cover" />
      )}

      <button
        type="button"
        onClick={() => onRemove(index)}
        disabled={isDeletingPhoto}
        className="absolute right-2 top-2 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-gray-700/70 transition-colors hover:bg-gray-800/80 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Remove image"
      >
        <IconComponent iconName="Cancel01Icon" color="#FFFFFF" size={18} />
      </button>
    </>
  );
};
