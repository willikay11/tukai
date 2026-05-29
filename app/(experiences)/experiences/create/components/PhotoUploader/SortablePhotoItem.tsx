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
}

const isExternalUrl = (src: string) => src.startsWith('https://') || src.startsWith('http://');

export const SortablePhotoItem = ({
  id,
  photo,
  index,
  onRemove,
  isDeletingPhoto,
  getBlobUrl,
}: SortablePhotoItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  const src = photo.file ? getBlobUrl(photo.file) : photo.url;

  return (
    <div
      ref={setNodeRef}
      style={style as React.CSSProperties}
      className="group relative h-[105px] w-[155px] rounded-xl"
    >
      {/* Drag handle — top-left grip icon */}
      <div
        {...attributes}
        {...listeners}
        className="absolute left-1 top-1 z-10 cursor-grab rounded bg-black/40 p-1 opacity-0 transition-opacity active:cursor-grabbing group-hover:opacity-100"
      >
        <IconComponent iconName="DragDropVerticalIcon" size={14} className="text-white" />
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
          className="rounded-xl object-cover"
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={`Photo ${index + 1}`}
          className="h-full w-full rounded-xl object-cover"
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
