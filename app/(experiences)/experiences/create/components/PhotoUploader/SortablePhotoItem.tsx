'use client';

import Image from 'next/image';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { IconComponent } from '@/app/shared/components/Icons';

import type { FormPhoto } from './index';

interface SortablePhotoItemProps {
  id: string; // unique id for dnd-kit
  photo: FormPhoto;
  index: number;
  onRemove: (index: number) => void;
  isDeletingPhoto: boolean;
  getBlobUrl: (file: File) => string;
  isDragActive: boolean; // whether any photo is being dragged
}

const isExternalUrl = (src: string) => src.startsWith('https://') || src.startsWith('http://');

export const SortablePhotoItem = ({
  id,
  photo,
  index,
  onRemove,
  isDeletingPhoto,
  getBlobUrl,
  isDragActive,
}: SortablePhotoItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : transition,
  };

  const src = photo.file ? getBlobUrl(photo.file) : photo.url;

  // Show dashed placeholder while dragging
  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style as React.CSSProperties}
        className="relative h-[105px] w-[155px] rounded-lg border-2 border-dashed border-primary/40 bg-primary/5"
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style as React.CSSProperties}
      {...attributes}
      {...listeners}
      className="group relative aspect-square h-[105px] w-[155px] cursor-grab overflow-hidden rounded-lg transition-transform duration-150 active:cursor-grabbing"
    >
      {/* Hover overlay with Hold04Icon */}
      <div
        className={`pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-black/20 transition-opacity duration-150 ${isDragActive && !isDragging ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'} `}
      >
        <IconComponent iconName="Hold04Icon" size={32} className="text-white drop-shadow-md" />
      </div>

      {/* Cover badge on first photo */}
      {index === 0 && (
        <div className="absolute bottom-1 left-1 z-10 rounded bg-black/50 px-1.5 py-0.5 text-[10px] font-medium text-white">
          Cover
        </div>
      )}

      {/* Image */}
      {isExternalUrl(photo.url) ? (
        <Image
          src={photo.url}
          alt={`Photo ${index + 1}`}
          fill
          sizes="155px"
          className="rounded-lg object-cover"
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={`Photo ${index + 1}`}
          className="h-full w-full rounded-lg object-cover"
        />
      )}

      {/* Remove button */}
      <button
        type="button"
        onClick={() => onRemove(index)}
        disabled={isDeletingPhoto}
        className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-gray-700/70 transition-colors hover:bg-gray-800/80 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Remove image"
      >
        <IconComponent iconName="Cancel01Icon" color="#FFFFFF" size={18} />
      </button>
    </div>
  );
};
