'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { ImageCropDialog } from '@/app/shared/components/Images';
import { useDeleteExperiencePhoto } from '@/app/shared/hooks/useExperiences';
import { useToast } from '@/app/shared/hooks/useToast';
import { getImageDimensions, imageNeedsCrop } from '@/utils/image-crop-utils';
import { validateExperienceImage } from '@/utils/image-utils';

import { PreviewGrid } from './PreviewGrid';

interface PhotoUploaderProps {
  photoUrl?: string | null;
  photoUrls?: string[];
  existingPhotoIds?: string[];
  onPhotoChange: (url: string | null) => void;
  onPhotoFilesChange?: (files: File[]) => void;
  onPhotoDelete?: (photoId: string) => void;
  error?: string;
}

export const PhotoUploader = ({
  photoUrl,
  photoUrls,
  existingPhotoIds,
  onPhotoChange,
  onPhotoFilesChange,
  onPhotoDelete,
  error,
}: PhotoUploaderProps) => {
  console.log('[PhotoUploader] Rendering:', { existingPhotoIds, photoUrl, photoUrlsCount: photoUrls?.length || 0 });
  const [isDeletingPhoto, setIsDeletingPhoto] = useState(false);
  const [existingPreviews, setExistingPreviews] = useState<Array<{ url: string; fileId: string }>>(
    photoUrls
      ? photoUrls.map((url, idx) => ({ url, fileId: `existing-${idx}` }))
      : photoUrl
        ? [{ url: photoUrl, fileId: 'existing-0' }]
        : [],
  );
  const [uploadPreviews, setUploadPreviews] = useState<Array<{ url: string; fileId: string }>>([]);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [cropQueue, setCropQueue] = useState<Array<{ file: File; objectUrl: string; fileId: string }>>([]);
  const [currentCrop, setCurrentCrop] = useState<{ file: File; objectUrl: string; fileId: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { mutateAsync: deletePhotoAsync } = useDeleteExperiencePhoto();
  const { toast } = useToast();

  // Sync existingPreviews when photoUrls prop changes
  useEffect(() => {
    console.log('[PhotoUploader] Syncing photoUrls:', photoUrls);
    if (photoUrls && photoUrls.length > 0) {
      const newExistingPreviews = photoUrls.map((url, idx) => ({ url, fileId: `existing-${idx}` }));
      setExistingPreviews(newExistingPreviews);
    } else if (photoUrl) {
      setExistingPreviews([{ url: photoUrl, fileId: 'existing-0' }]);
    } else {
      setExistingPreviews([]);
    }
  }, [photoUrl, photoUrls]);

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
      const toAdd: File[] = [];
      const toCrop: Array<{ file: File; objectUrl: string; fileId: string }> = [];

      for (const file of validFiles) {
        try {
          const { width, height, objectUrl } = await getImageDimensions(file);

          if (imageNeedsCrop(width, height)) {
            // Queue for cropping — will add to preview immediately
            const fileId = `portrait-${Date.now()}-${Math.random()}`;
            toCrop.push({ file, objectUrl, fileId });
          } else {
            // Already landscape — add directly
            URL.revokeObjectURL(objectUrl);
            toAdd.push(file);
          }
        } catch {
          // If dimension check fails, add file anyway
          toAdd.push(file);
        }
      }

      // Add landscape images immediately to both preview and files
      if (toAdd.length > 0) {
        const newUploadedFiles = [...uploadedFiles, ...toAdd];
        setUploadedFiles(newUploadedFiles);

        if (onPhotoFilesChange) {
          onPhotoFilesChange(newUploadedFiles);
        }

        // Create previews for landscape images
        toAdd.forEach((file) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const dataUrl = e.target?.result as string;
            const fileId = `landscape-${Date.now()}-${Math.random()}`;
            setUploadPreviews((prev) => [...prev, { url: dataUrl, fileId }]);
            onPhotoChange(dataUrl);
          };
          reader.readAsDataURL(file);
        });
      }

      // Queue portrait images for crop — add to preview so user can see them
      if (toCrop.length > 0) {
        setUploadPreviews((prev) => [
          ...prev,
          ...toCrop.map((item) => ({ url: item.objectUrl, fileId: item.fileId })),
        ]);

        setCropQueue(toCrop);
        setCurrentCrop(toCrop[0]);
      }
    },
    [uploadedFiles, onPhotoChange, onPhotoFilesChange, toast],
  );

  const handleCropComplete = useCallback(
    (croppedFile: File) => {
      // Clean up original object URL
      if (currentCrop) URL.revokeObjectURL(currentCrop.objectUrl);

      // Add cropped file to uploaded files and update parent
      const newUploadedFiles = [...uploadedFiles, croppedFile];
      setUploadedFiles(newUploadedFiles);

      if (onPhotoFilesChange) {
        onPhotoFilesChange(newUploadedFiles);
      }

      // Replace preview with cropped image
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        // Replace the portrait preview with cropped preview by fileId
        setUploadPreviews((prev) =>
          prev.map((item) =>
            item.fileId === currentCrop?.fileId ? { ...item, url: dataUrl } : item,
          ),
        );
        onPhotoChange(dataUrl);
      };
      reader.readAsDataURL(croppedFile);

      // Move to next in queue
      const remaining = cropQueue.slice(1);
      setCropQueue(remaining);
      setCurrentCrop(remaining.length > 0 ? remaining[0] : null);
    },
    [currentCrop, cropQueue, uploadedFiles, onPhotoChange, onPhotoFilesChange],
  );

  const handleCropCancel = useCallback(() => {
    // Remove from preview and discard this photo
    if (currentCrop) {
      URL.revokeObjectURL(currentCrop.objectUrl);

      // Remove from upload previews by fileId
      setUploadPreviews((prev) => prev.filter((item) => item.fileId !== currentCrop.fileId));
    }

    const remaining = cropQueue.slice(1);
    setCropQueue(remaining);
    setCurrentCrop(remaining.length > 0 ? remaining[0] : null);
  }, [currentCrop, cropQueue]);

  const handleRemovePreview = useCallback(
    async (index: number) => {
      console.log('[PhotoUploader] Remove clicked:', { index, existingPreviews: existingPreviews.length, uploadPreviews: uploadPreviews.length });

      const allPreviews = [
        ...existingPreviews.map((item, idx) => ({ ...item, isExisting: true, originalIndex: idx })),
        ...uploadPreviews.map((item, idx) => ({ ...item, isExisting: false, uploadIndex: idx })),
      ];

      console.log('[PhotoUploader] All previews:', { total: allPreviews.length, allPreviews });

      const itemToRemove = allPreviews[index];
      console.log('[PhotoUploader] Item to remove:', { itemToRemove });

      if (!itemToRemove) {
        console.warn('[PhotoUploader] Item not found at index', index);
        return;
      }

      if (itemToRemove.isExisting) {
        console.log('[PhotoUploader] Removing existing photo:', itemToRemove.originalIndex);
        const existingPhotoId = existingPhotoIds?.[itemToRemove.originalIndex];

        if (existingPhotoId) {
          setIsDeletingPhoto(true);
          try {
            await deletePhotoAsync(existingPhotoId);
            if (onPhotoDelete) {
              onPhotoDelete(existingPhotoId);
            }
          } catch (error: any) {
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

        console.log('[PhotoUploader] Filtering existing previews:', itemToRemove.originalIndex);
        setExistingPreviews((prev) => {
          const newPrev = prev.filter((_, i) => i !== itemToRemove.originalIndex);
          console.log('[PhotoUploader] Existing previews after filter:', { before: prev.length, after: newPrev.length });
          return newPrev;
        });
      } else {
        // Remove uploaded photo
        const uploadIndex = itemToRemove.uploadIndex;
        console.log('[PhotoUploader] Removing uploaded photo:', uploadIndex);

        // Revoke object URL if it's not an external URL
        if (
          !itemToRemove.url.startsWith('https://') &&
          !itemToRemove.url.startsWith('http://')
        ) {
          console.log('[PhotoUploader] Revoking object URL:', itemToRemove.url);
          URL.revokeObjectURL(itemToRemove.url);
        }

        console.log('[PhotoUploader] Filtering upload previews:', uploadIndex);
        setUploadPreviews((prev) => {
          const newPrev = prev.filter((_, i) => i !== uploadIndex);
          console.log('[PhotoUploader] Upload previews after filter:', { before: prev.length, after: newPrev.length });
          return newPrev;
        });

        const newUploadedFiles = uploadedFiles.filter((_, i) => i !== uploadIndex);
        console.log('[PhotoUploader] Updated uploaded files:', { before: uploadedFiles.length, after: newUploadedFiles.length });
        setUploadedFiles(newUploadedFiles);

        if (onPhotoFilesChange) {
          console.log('[PhotoUploader] Calling onPhotoFilesChange with', newUploadedFiles.length, 'files');
          onPhotoFilesChange(newUploadedFiles);
        }
      }
    },
    [existingPreviews, uploadPreviews, existingPhotoIds, uploadedFiles, deletePhotoAsync, onPhotoDelete, onPhotoFilesChange, toast],
  );

  const previews = [
    ...existingPreviews.map((item, index) => ({
      url: item.url,
      index,
      fileId: item.fileId,
    })),
    ...uploadPreviews.map((item, index) => ({
      url: item.url,
      index: existingPreviews.length + index,
      fileId: item.fileId,
    })),
  ];

  console.log('[PhotoUploader] Previews updated:', {
    existingCount: existingPreviews.length,
    uploadCount: uploadPreviews.length,
    totalPreviews: previews.length,
    previews,
  });

  return (
    <>
      <div className="space-y-2">
        <p className="text-xs font-medium text-gray-800">Upload experience poster</p>
        <PreviewGrid
          previews={previews}
          onRemove={handleRemovePreview}
          onAddClick={() => inputRef.current?.click()}
          maxFiles={6}
          isDeletingPhoto={isDeletingPhoto}
        />
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
        <div className="space-y-1 text-xs text-muted-foreground">
          <p>JPEG, PNG or WebP · Minimum 800×450px · Max 10MB</p>
          <p>Best results with landscape photos (16:9 or 4:3)</p>
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>

      {/* Crop dialog — renders on top when a portrait image is selected */}
      {currentCrop && (
        <ImageCropDialog
          imageSrc={currentCrop.objectUrl}
          fileName={currentCrop.file.name}
          fileType={currentCrop.file.type}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}
    </>
  );
};
