'use client';

import { useCallback, useState } from 'react';

import { FileUploadField } from '@/app/shared/components/Forms';
import { useDeleteExperiencePhoto } from '@/app/shared/hooks/useExperiences';
import { useToast } from '@/app/shared/hooks/useToast';
import { PhotoItem } from '@/types/photo';

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
  const [isDeletingPhoto, setIsDeletingPhoto] = useState(false);
  const { mutateAsync: deletePhotoAsync } = useDeleteExperiencePhoto();
  const { toast } = useToast();

  const handleFilesChange = useCallback(
    (files: File[]) => {
      if (files.length > 0) {
        // Pass the File objects to the parent
        if (onPhotoFilesChange) {
          onPhotoFilesChange(files);
        }
        // Process only new files - compare with the single photoUrl we currently have
        files.forEach((file) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const dataUrl = e.target?.result as string;
            onPhotoChange(dataUrl);
          };
          reader.readAsDataURL(file);
        });
      }
    },
    [onPhotoChange, onPhotoFilesChange],
  );

  const handleDeleteExistingPhoto = useCallback(
    async (photoId: string) => {
      setIsDeletingPhoto(true);
      try {
        console.log('[PhotoUploader] Deleting photo:', photoId);
        await deletePhotoAsync(photoId);
        console.log('[PhotoUploader] Photo deleted successfully');
        if (onPhotoDelete) {
          onPhotoDelete(photoId);
        }
      } catch (error: any) {
        console.error('[PhotoUploader] Failed to delete photo:', error);
        toast({
          title: 'Error',
          description: 'Failed to delete photo. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsDeletingPhoto(false);
      }
    },
    [deletePhotoAsync, onPhotoDelete, toast],
  );

  const initialUrls = photoUrls || (photoUrl ? [photoUrl] : []);

  return (
    <div className="space-y-2">
      <FileUploadField
        id="experience-photo"
        label="Upload a experience poster (Dimensions: 540*540, Max 15 Mbs)"
        buttonText="Add Photo(s)"
        accept="image/*"
        multiple={true}
        maxFiles={6}
        minImageWidth={540}
        minImageHeight={540}
        initialUrls={initialUrls}
        existingPhotoIds={existingPhotoIds}
        onFilesChange={handleFilesChange}
        onDeleteExisting={handleDeleteExistingPhoto}
        isDeletingPhoto={isDeletingPhoto}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};
