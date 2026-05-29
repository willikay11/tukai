'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import {
  DndContext,
  DragEndEvent,
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

import { ImageCropDialog } from '@/app/shared/components/Images';
import { useDeleteExperiencePhoto } from '@/app/shared/hooks/useExperiences';
import { useToast } from '@/app/shared/hooks/useToast';
import { getImageDimensions, imageNeedsCrop } from '@/utils/image-crop-utils';
import { validateExperienceImage } from '@/utils/image-utils';

import { SortablePhotoItem } from './SortablePhotoItem';

export interface FormPhoto {
  id: string; // Either 'temp-{timestamp}' or real ID from DB
  url: string; // Photo URL or data URI
  file?: File; // Optional, only for new photos
  isTempId?: boolean; // Flag to know if we need to replace ID after save
}

interface PhotoUploaderProps {
  photos: FormPhoto[];
  onPhotoChange: (photo: FormPhoto | null) => void;
  onPhotoFilesChange?: (photos: FormPhoto[]) => void;
  onPhotoDelete?: (photoId: string) => void;
  error?: string;
}

export const PhotoUploader = ({
  photos,
  onPhotoChange,
  onPhotoFilesChange,
  onPhotoDelete,
  error,
}: PhotoUploaderProps) => {
  const [isDeletingPhoto, setIsDeletingPhoto] = useState(false);
  const [cropQueue, setCropQueue] = useState<Array<{ photo: FormPhoto; objectUrl: string }>>([]);
  const [currentCrop, setCurrentCrop] = useState<{ photo: FormPhoto; objectUrl: string } | null>(
    null,
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const blobUrlMap = useRef<Map<File, string>>(new Map());
  const { mutateAsync: deletePhotoAsync } = useDeleteExperiencePhoto();
  const { toast } = useToast();

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

  // Handle drag end — reorder the array
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const photoIds = photos.map((photo, index) =>
      photo.file ? `new-${index}-${photo.id}` : photo.id,
    );

    const oldIndex = photoIds.indexOf(active.id as string);
    const newIndex = photoIds.indexOf(over.id as string);

    if (oldIndex !== -1 && newIndex !== -1) {
      const reorderedPhotos = arrayMove(photos, oldIndex, newIndex);
      onPhotoFilesChange?.(reorderedPhotos);
    }
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

      for (const { file, validation } of results) {
        if (!validation.valid) {
          errors.push(`${file.name}: ${validation.error}`);
        } else {
          validFiles.push(file);
        }
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
      if (!itemToRemove.isTempId) {
        // It's an existing photo with real ID - call delete API
        setIsDeletingPhoto(true);
        try {
          await deletePhotoAsync(itemToRemove.id);
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
    [photos, deletePhotoAsync, onPhotoDelete, onPhotoFilesChange, toast],
  );

  // Generate stable IDs for dnd-kit
  const photoIds = photos.map((photo, index) =>
    photo.file ? `new-${index}-${photo.id}` : photo.id,
  );

  const hasReachedMax = photos.length >= 6;

  return (
    <>
      <div className="space-y-2">
        <p className="text-xs font-medium text-gray-800">Upload experience poster</p>

        {/* Draggable photo grid */}
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={photoIds} strategy={rectSortingStrategy}>
            <div className="flex flex-wrap items-start gap-3">
              {photos.map((photo, index) => (
                <SortablePhotoItem
                  key={photoIds[index]}
                  id={photoIds[index]}
                  photo={photo}
                  index={index}
                  onRemove={handleRemovePreview}
                  isDeletingPhoto={isDeletingPhoto}
                  getBlobUrl={getBlobUrl}
                />
              ))}

              {/* Add more photos button */}
              {!hasReachedMax && (
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="inline-flex h-[105px] w-[155px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-emerald-500/50 bg-emerald-50/50 text-center hover:border-emerald-600 hover:bg-emerald-100/50"
                >
                  {/* Icon */}
                  <svg
                    className="h-5 w-5 text-emerald-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  <span className="mt-1 text-[10px] font-medium text-emerald-700">
                    Add Photo(s)
                  </span>
                </button>
              )}
            </div>
          </SortableContext>
        </DndContext>

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
        <div className="space-y-1 text-xs text-muted-foreground">
          <p>JPEG, PNG or WebP · Minimum 800×450px · Max 10MB</p>
          <p>Best results with landscape photos (16:9 or 4:3)</p>
        </div>

        {/* Drag hint — only show if 2+ photos */}
        {photos.length > 1 && (
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
