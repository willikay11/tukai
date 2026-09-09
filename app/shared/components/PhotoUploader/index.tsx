'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import Image from 'next/image';

import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';

import { IconComponent } from '@/app/shared/components/Icons';
import { ImageCropDialog } from '@/app/shared/components/Images';
import { useToast } from '@/app/shared/hooks/useToast';
import { cn } from '@/lib/utils';
import { getImageDimensions, imageNeedsCrop } from '@/utils/image-crop-utils';
import { validateExperienceImage } from '@/utils/image-utils';

import { PhotoTile, type PhotoTileShape, TILE_SHAPE_CLASSES } from './PhotoTile';
import { SortablePhotoItem } from './SortablePhotoItem';

export interface FormPhoto {
  id: string; // Either 'temp-{timestamp}' or real ID from DB
  url: string; // Photo URL or data URI
  file?: File; // Optional, only for new photos
  isTempId?: boolean; // Flag to know if we need to replace ID after save
  // Set by the API. Without one the first photo is the cover, as the grid's
  // order decides it.
  isCover?: boolean;
}

interface PhotoUploaderProps {
  photos: FormPhoto[];
  onPhotoChange: (photo: FormPhoto | null) => void;
  onPhotoFilesChange?: (photos: FormPhoto[]) => void;
  onPhotoDelete?: (photoId: string) => void;
  error?: string;
  /** What the grid is for. Defaults to the experience poster copy. */
  label?: React.ReactNode;
  hint?: React.ReactNode;
  maxPhotos?: number;
  /** Off where an order cannot be persisted, as it cannot be for a place. */
  sortable?: boolean;
  shape?: PhotoTileShape;
  /**
   * Deletes a photo that already exists, the moment it is removed.
   *
   * The endpoint differs by what the photos belong to, so it is the caller's:
   * this component knows nothing of experiences or places. Left out, removal is
   * local only — which is what a form that applies its removals on its own save
   * wants, as the edit-place form does.
   */
  onDeleteExisting?: (photoId: string) => Promise<unknown>;
}

/**
 * The drag context, present only when the grid can be reordered. Without it the
 * children render as they are — `useSortable` needs a `DndContext` above it, so
 * a non-sortable grid must not be given one.
 */
const PhotoGridShell = ({
  sortable,
  sensors,
  photoIds,
  onDragStart,
  onDragEnd,
  onDragCancel,
  activePhoto,
  getBlobUrl,
  shape,
  children,
}: {
  sortable: boolean;
  sensors: ReturnType<typeof useSensors>;
  photoIds: string[];
  onDragStart: (event: DragStartEvent) => void;
  onDragEnd: (event: DragEndEvent) => void;
  onDragCancel: () => void;
  activePhoto: FormPhoto | null;
  getBlobUrl: (file: File) => string;
  shape: PhotoTileShape;
  children: React.ReactNode;
}) => {
  if (!sortable) return <>{children}</>;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragCancel={onDragCancel}
    >
      <SortableContext items={photoIds} strategy={rectSortingStrategy}>
        {children}
      </SortableContext>

      {/* Drag overlay — shows floating photo while dragging */}
      <DragOverlay dropAnimation={null}>
        {activePhoto && (
          <div
            className={cn(
              'relative rotate-6 scale-105 cursor-grabbing overflow-hidden shadow-2xl ring-2 ring-primary',
              TILE_SHAPE_CLASSES[shape],
            )}
          >
            {activePhoto.file ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={getBlobUrl(activePhoto.file)}
                alt="Dragging"
                className="h-full w-full object-cover"
              />
            ) : (
              <Image
                src={activePhoto.url}
                alt="Dragging"
                fill
                sizes="155px"
                className="object-cover"
              />
            )}
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
};

export const PhotoUploader = ({
  photos,
  onPhotoChange,
  onPhotoFilesChange,
  onPhotoDelete,
  error,
  label = 'Upload experience poster (JPEG, PNG or WebP · Square images · 500×500px or larger recommended · Max 10MB)',
  hint = 'Non-square images will be cropped automatically',
  maxPhotos = 6,
  sortable = true,
  shape = 'poster',
  onDeleteExisting,
}: PhotoUploaderProps) => {
  const [isDeletingPhoto, setIsDeletingPhoto] = useState(false);
  const [cropQueue, setCropQueue] = useState<Array<{ photo: FormPhoto; objectUrl: string }>>([]);
  const [currentCrop, setCurrentCrop] = useState<{ photo: FormPhoto; objectUrl: string } | null>(
    null,
  );
  const [activeId, setActiveId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const blobUrlMap = useRef<Map<File, string>>(new Map());
  const { toast } = useToast();

  // Find the currently dragged photo
  const activePhoto = activeId ? (photos.find((p) => p.id === activeId) ?? null) : null;

  // Drag sensors — 8px threshold prevents accidental drag on tap
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Get or create blob URL for a file
  const getBlobUrl = useCallback((file: File): string => {
    if (!blobUrlMap.current.has(file)) {
      blobUrlMap.current.set(file, URL.createObjectURL(file));
    }
    return blobUrlMap.current.get(file)!;
  }, []);

  // Clean up blob URLs on unmount
  useEffect(() => {
    const urlMap = blobUrlMap.current;
    return () => {
      urlMap.forEach((url) => URL.revokeObjectURL(url));
      urlMap.clear();
    };
  }, []);

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  // Handle drag end — reorder the array
  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);

    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const photoIds = photos.map((photo) => photo.id);
    const oldIndex = photoIds.indexOf(active.id as string);
    const newIndex = photoIds.indexOf(over.id as string);

    if (oldIndex !== -1 && newIndex !== -1) {
      const reorderedPhotos = arrayMove(photos, oldIndex, newIndex);
      onPhotoFilesChange?.(reorderedPhotos);
    }
  };

  // Handle drag cancel
  const handleDragCancel = () => {
    setActiveId(null);
  };

  const handleFilesSelected = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return;

      // Validate all files
      const results = await Promise.all(
        files.map(async (file) => ({
          file,
          validation: await validateExperienceImage(file),
        })),
      );

      const validFiles: File[] = [];
      const errors: string[] = [];
      const warnings: string[] = [];

      for (const { file, validation } of results) {
        if (!validation.valid) {
          errors.push(`${file.name}: ${validation.error}`);
          continue;
        }

        if (validation.warning) {
          warnings.push(`${file.name}: ${validation.warning}`);
        }
        validFiles.push(file);
      }

      // Show errors
      if (errors.length > 0) {
        errors.forEach((error) =>
          toast({
            description: error,
            variant: 'destructive',
          }),
        );
      }

      // Advisory only — these files still upload
      if (warnings.length > 0) {
        warnings.forEach((warning) =>
          toast({
            description: warning,
            variant: 'info',
          }),
        );
      }

      if (validFiles.length === 0) return;

      // Separate files that need cropping from those that don't
      const toCrop: Array<{ file: File; objectUrl: string; tempId: string }> = [];

      for (const file of validFiles) {
        try {
          const { width, height, objectUrl } = await getImageDimensions(file);

          // Create temp ID
          const tempId = `temp-${Date.now()}-${Math.random()}`;

          if (imageNeedsCrop(width, height)) {
            // Queue for cropping — will convert to data URL after adding to preview
            toCrop.push({ file, objectUrl, tempId });
          } else {
            // Already landscape — add directly with data URL
            URL.revokeObjectURL(objectUrl);
            const reader = new FileReader();
            reader.onload = (e) => {
              const dataUrl = e.target?.result as string;
              const landscapePhoto: FormPhoto = {
                id: tempId,
                url: dataUrl,
                file,
                isTempId: true,
              };
              const updatedPhotos = [...photos, landscapePhoto];
              onPhotoFilesChange?.(updatedPhotos);
              onPhotoChange?.(landscapePhoto);
            };
            reader.readAsDataURL(file);
          }
        } catch {
          // If dimension check fails, add file anyway with temp ID
          const tempId = `temp-${Date.now()}-${Math.random()}`;
          const reader = new FileReader();
          reader.onload = (e) => {
            const dataUrl = e.target?.result as string;
            const fallbackPhoto: FormPhoto = {
              id: tempId,
              url: dataUrl,
              file,
              isTempId: true,
            };
            const updatedPhotos = [...photos, fallbackPhoto];
            onPhotoFilesChange?.(updatedPhotos);
            onPhotoChange?.(fallbackPhoto);
          };
          reader.readAsDataURL(file);
        }
      }

      // Process portrait images — convert to data URLs and add to preview
      if (toCrop.length > 0) {
        const portraitPhotos: FormPhoto[] = [];

        for (const { file, objectUrl, tempId } of toCrop) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const dataUrl = e.target?.result as string;
            const portraitPhoto: FormPhoto = {
              id: tempId,
              url: dataUrl,
              file,
              isTempId: true,
            };
            portraitPhotos.push(portraitPhoto);

            // When all portraits are converted, add to preview and queue for crop
            if (portraitPhotos.length === toCrop.length) {
              const updatedPhotos = [...photos, ...portraitPhotos];
              onPhotoFilesChange?.(updatedPhotos);

              // Queue for crop with the data URLs now available
              const cropQueue = portraitPhotos.map((p) => ({ photo: p, objectUrl: p.url }));
              setCropQueue(cropQueue);
              setCurrentCrop(cropQueue[0]);
            }
          };
          // Revoke the object URL since we're converting to data URL
          URL.revokeObjectURL(objectUrl);
          reader.readAsDataURL(file);
        }
      }
    },
    [photos, onPhotoChange, onPhotoFilesChange, toast],
  );

  const handleCropComplete = useCallback(
    (croppedFile: File) => {
      if (!currentCrop) return;

      // Note: currentCrop.objectUrl is now a data URL, no need to revoke

      // Create preview for cropped image
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        // Replace the portrait with cropped version, keeping same temp ID
        const croppedPhoto: FormPhoto = {
          id: currentCrop.photo.id,
          url: dataUrl,
          file: croppedFile,
          isTempId: true,
        };

        // Replace in photos array
        const updatedPhotos = photos.map((p) => (p.id === currentCrop.photo.id ? croppedPhoto : p));
        onPhotoFilesChange?.(updatedPhotos);
        onPhotoChange?.(croppedPhoto);
      };
      reader.readAsDataURL(croppedFile);

      // Move to next in queue
      const remaining = cropQueue.slice(1);
      setCropQueue(remaining);
      setCurrentCrop(remaining.length > 0 ? remaining[0] : null);
    },
    [currentCrop, cropQueue, photos, onPhotoChange, onPhotoFilesChange],
  );

  const handleCropCancel = useCallback(() => {
    if (!currentCrop) return;

    // Remove from preview and discard this photo
    URL.revokeObjectURL(currentCrop.objectUrl);

    // Remove from photos array
    const updatedPhotos = photos.filter((p) => p.id !== currentCrop.photo.id);
    onPhotoFilesChange?.(updatedPhotos);

    const remaining = cropQueue.slice(1);
    setCropQueue(remaining);
    setCurrentCrop(remaining.length > 0 ? remaining[0] : null);
  }, [currentCrop, cropQueue, photos, onPhotoFilesChange]);

  const handleRemovePreview = useCallback(
    async (index: number) => {
      const itemToRemove = photos[index];
      if (!itemToRemove) return;

      // Check if it's an existing photo (real ID from DB) vs new photo (temp ID)
      if (!itemToRemove.isTempId && onDeleteExisting) {
        // It's an existing photo with real ID - call delete API
        setIsDeletingPhoto(true);
        try {
          await onDeleteExisting(itemToRemove.id);
          onPhotoDelete?.(itemToRemove.id);
        } catch {
          toast({
            title: 'Error',
            description: 'Failed to delete photo. Please try again.',
            variant: 'destructive',
          });
          setIsDeletingPhoto(false);
          return;
        }
        setIsDeletingPhoto(false);
      }

      // Remove from preview URLs
      const updatedPhotos = photos.filter((_, i) => i !== index);
      onPhotoFilesChange?.(updatedPhotos);

      // Revoke object URL if it's not an external URL
      if (!itemToRemove.url.startsWith('https://') && !itemToRemove.url.startsWith('http://')) {
        URL.revokeObjectURL(itemToRemove.url);
      }
    },
    [photos, onDeleteExisting, onPhotoDelete, onPhotoFilesChange, toast],
  );

  // Generate stable IDs for dnd-kit — both existing and new photos have stable IDs
  const photoIds = photos.map((photo) => photo.id);

  const hasReachedMax = photos.length >= maxPhotos;

  // Whichever photo the API flagged, and the first one where it flagged none
  const coverId = photos.find((photo) => photo.isCover)?.id ?? photos[0]?.id;

  return (
    <>
      <div className="space-y-2">
        <div className="space-y-1">
          <p className="text-xs font-medium text-gray-800">{label}</p>
          {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>

        {/* The grid, wrapped in a drag context only where an order can be
            persisted — a place's photos have no endpoint that would keep one */}
        <PhotoGridShell
          sortable={sortable}
          sensors={sensors}
          photoIds={photoIds}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
          activePhoto={activePhoto}
          getBlobUrl={getBlobUrl}
          shape={shape}
        >
          <div
            className={cn(
              shape === 'square'
                ? 'grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4'
                : 'flex flex-wrap items-start gap-3',
            )}
          >
            {photos.map((photo, index) =>
              sortable ? (
                <SortablePhotoItem
                  key={photoIds[index]}
                  id={photoIds[index]}
                  photo={photo}
                  index={index}
                  shape={shape}
                  isCover={photo.id === coverId}
                  onRemove={handleRemovePreview}
                  isDeletingPhoto={isDeletingPhoto}
                  getBlobUrl={getBlobUrl}
                  isDragActive={activeId !== null}
                />
              ) : (
                <div
                  key={photoIds[index]}
                  className={cn('relative overflow-hidden bg-gray-100', TILE_SHAPE_CLASSES[shape])}
                >
                  <PhotoTile
                    photo={photo}
                    index={index}
                    shape={shape}
                    isCover={photo.id === coverId}
                    isDeletingPhoto={isDeletingPhoto}
                    getBlobUrl={getBlobUrl}
                    onRemove={handleRemovePreview}
                  />
                </div>
              ),
            )}

            {!hasReachedMax && (
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className={cn(
                  'inline-flex cursor-pointer flex-col items-center justify-center border-2 border-dashed border-emerald-500/50 bg-emerald-50/50 text-center hover:border-emerald-600 hover:bg-emerald-100/50',
                  TILE_SHAPE_CLASSES[shape],
                )}
              >
                <IconComponent iconName="ImageAdd02Icon" color="#10B981" size={20} />
                <span className="mt-1 text-[10px] font-medium text-emerald-700">Add Photo(s)</span>
              </button>
            )}
          </div>
        </PhotoGridShell>

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={(e) => {
            const files = e.target.files ? Array.from(e.target.files) : [];
            handleFilesSelected(files);
            e.target.value = '';
          }}
          className="hidden"
        />

        {/* Info text and hint */}
        {/* <div className="space-y-1 text-xs text-muted-foreground">
          <p>JPEG, PNG or WebP · Minimum 800×450px · Max 10MB</p>
          <p>Best results with landscape photos (16:9 or 4:3)</p>
        </div> */}

        {/* Drag hint — only show if 2+ photos */}
        {sortable && photos.length > 1 && (
          <p className="text-xs text-muted-foreground">
            Drag photos to reorder · First photo is the cover
          </p>
        )}

        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>

      {/* Crop dialog — renders on top when a portrait image is selected */}
      {currentCrop && (
        <ImageCropDialog
          imageSrc={currentCrop.objectUrl}
          fileName={currentCrop.photo.file?.name || 'photo'}
          fileType={currentCrop.photo.file?.type || 'image/jpeg'}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}
    </>
  );
};
