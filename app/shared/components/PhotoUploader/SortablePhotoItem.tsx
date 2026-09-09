'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { IconComponent } from '@/app/shared/components/Icons';
import { cn } from '@/lib/utils';

import { PhotoTile, type PhotoTileShape, TILE_SHAPE_CLASSES } from './PhotoTile';
import type { FormPhoto } from './index';

interface SortablePhotoItemProps {
  id: string; // unique id for dnd-kit
  photo: FormPhoto;
  index: number;
  onRemove: (index: number) => void;
  isDeletingPhoto: boolean;
  getBlobUrl: (file: File) => string;
  isDragActive: boolean; // whether any photo is being dragged
  shape?: PhotoTileShape;
  isCover: boolean;
}

export const SortablePhotoItem = ({
  id,
  photo,
  index,
  onRemove,
  isDeletingPhoto,
  getBlobUrl,
  isDragActive,
  shape = 'poster',
  isCover,
}: SortablePhotoItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : transition,
  };

  // Show dashed placeholder while dragging
  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style as React.CSSProperties}
        className={cn(
          'relative border-2 border-dashed border-primary/40 bg-primary/5',
          TILE_SHAPE_CLASSES[shape],
        )}
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style as React.CSSProperties}
      {...attributes}
      {...listeners}
      className={cn(
        'group relative cursor-grab overflow-hidden transition-transform duration-150 active:cursor-grabbing',
        TILE_SHAPE_CLASSES[shape],
      )}
    >
      <PhotoTile
        photo={photo}
        index={index}
        shape={shape}
        isCover={isCover}
        isDeletingPhoto={isDeletingPhoto}
        getBlobUrl={getBlobUrl}
        onRemove={onRemove}
      >
        {/* Hover overlay with Hold04Icon */}
        <div
          className={`pointer-events-none absolute inset-0 z-10 flex items-center justify-center transition-opacity duration-150 ${isDragActive && !isDragging ? 'opacity-0' : 'bg-black/20 opacity-0 group-hover:opacity-100'} `}
        >
          <IconComponent iconName="Hold04Icon" size={32} className="text-white drop-shadow-md" />
        </div>
      </PhotoTile>
    </div>
  );
};
