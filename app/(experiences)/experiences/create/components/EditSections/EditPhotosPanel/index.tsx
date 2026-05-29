'use client';

import { useCallback, useState } from 'react';

import {
  useAddExperiencePhotos,
  useDeleteExperiencePhoto,
} from '@/app/shared/hooks/useExperiences';
import { useToast } from '@/app/shared/hooks/useToast';
import { Button } from '@/components/ui/button';
import { Photo } from '@/types/photo';

import { PhotoUploader } from '../../PhotoUploader';

interface LocalPhoto {
  id?: string; // Present if it's an existing photo
  photo: string; // URL or base64
  file?: File; // Present if it's a new photo
  isCover?: boolean;
}

interface EditPhotosPanelProps {
  photos: Photo[];
  experienceId?: string;
  onPhotosChange: (photos: Photo[]) => void;
  onClose: () => void;
  onAddPhotos?: (files: File[]) => Promise<void>;
  maxPhotos?: number;
}

export const EditPhotosPanel = ({
  photos,
  experienceId,
  onPhotosChange,
  onClose,
  onAddPhotos,
  maxPhotos = 9,
}: EditPhotosPanelProps) => {
  const [localPhotos, setLocalPhotos] = useState<LocalPhoto[]>(
    photos.map((p) => ({ id: p.id, photo: p.photo, isCover: p.isCover })),
  );
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // API hooks
  const { mutateAsync: addPhotosAsync } = useAddExperiencePhotos(experienceId || '');
  const { mutateAsync: deletePhotoAsync } = useDeleteExperiencePhoto();

  const handleAddPhotos = useCallback(
    (files: File[]) => {
      if (localPhotos.length + files.length > maxPhotos) {
        toast({
          title: 'Too many photos',
          description: `You can upload a maximum of ${maxPhotos} photos.`,
          variant: 'destructive',
        });
        return;
      }

      files.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const result = event.target?.result as string;
          setLocalPhotos((prev) => [...prev, { photo: result, file }]);
        };
        reader.readAsDataURL(file);
      });
    },
    [localPhotos.length, maxPhotos, toast],
  );

  const handleRemovePhoto = async (photoId: string) => {
    const index = localPhotos.findIndex((p) => (p.id || '') === photoId);
    if (index === -1) return;

    const photoToRemove = localPhotos[index];

    // If it's an existing photo, delete it immediately via API
    if (photoToRemove.id) {
      try {
        await deletePhotoAsync(photoToRemove.id);
      } catch (error: any) {
        toast({
          title: 'Error',
          description: 'Failed to delete photo. Please try again.',
          variant: 'destructive',
        });
        // Don't remove from UI if API failed
        return;
      }
    }

    // Remove from local state
    setLocalPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = useCallback(async () => {
    setIsLoading(true);
    try {
      // Collect new files to upload
      const newFiles = localPhotos.filter((p) => p.file).map((p) => p.file!);

      // Upload new photos if any
      if (newFiles.length > 0) {
        if (onAddPhotos) {
          await onAddPhotos(newFiles);
        } else if (experienceId) {
          await addPhotosAsync(newFiles);
        }
      }

      // Update local state (photos are already deleted via immediate API call)
      const updatedPhotos: Photo[] = localPhotos
        .filter((p) => !p.file) // Remove new files since they're uploaded
        .map((p) => ({
          id: p.id || `temp-${Date.now()}`,
          photo: p.photo,
          isCover: p.isCover,
        }));

      onPhotosChange(updatedPhotos);
      toast({
        title: 'Success',
        description: 'Photos updated successfully.',
        variant: 'success',
      });
      onClose();
    } catch (error: any) {
      const message = error?.message || 'Failed to update photos';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
      console.error('[EditPhotosPanel] Error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [localPhotos, experienceId, onPhotosChange, onClose, onAddPhotos, addPhotosAsync, toast]);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-900">Edit Photos</h3>
        <p className="mt-1 text-xs text-gray-600">You can upload up to {maxPhotos} photos</p>
      </div>

      <PhotoUploader
        photos={localPhotos.map((p) => ({
          id: p.id || `temp-${Date.now()}-${Math.random()}`,
          url: p.photo,
          isTempId: !p.id,
        }))}
        onPhotoChange={() => {}} // Not used in edit context
        onPhotoFilesChange={(photos) => {
          handleAddPhotos(photos.filter((p) => p.file).map((p) => p.file!));
        }}
        onPhotoDelete={handleRemovePhoto}
      />

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isLoading}
          className="rounded-[50px]"
        >
          Cancel
        </Button>
        <Button
          type="button"
          variant="gradient"
          onClick={handleSave}
          disabled={isLoading}
          className="rounded-[50px]"
        >
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
};
