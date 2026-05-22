'use client';

import { useCallback, useState } from 'react';

import { IconComponent } from '@/app/shared/components/Icons';
import {
  useAddExperiencePhotos,
  useDeleteExperiencePhoto,
} from '@/app/shared/hooks/useExperiences';
import { useToast } from '@/app/shared/hooks/useToast';
import { Button } from '@/components/ui/button';
import { Photo } from '@/types/photo';

interface LocalPhoto {
  id?: string; // Present if it's an existing photo
  photo: string; // URL or base64
  file?: File; // Present if it's a new photo
  isCover?: boolean;
}

interface PhotoEditPanelProps {
  photos: Photo[];
  experienceId?: string;
  onPhotosChange: (photos: Photo[]) => void;
  onClose: () => void;
  onAddPhotos?: (files: File[]) => Promise<void>;
  onDeletePhoto?: (photoId: string) => Promise<void>;
  maxPhotos?: number;
}

export const PhotoEditPanel = ({
  photos,
  experienceId,
  onPhotosChange,
  onClose,
  onAddPhotos,
  onDeletePhoto,
  maxPhotos = 9,
}: PhotoEditPanelProps) => {
  const [localPhotos, setLocalPhotos] = useState<LocalPhoto[]>(
    photos.map((p) => ({ id: p.id, photo: p.photo, isCover: p.isCover })),
  );
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // API hooks
  const { mutateAsync: addPhotosAsync } = useAddExperiencePhotos(experienceId || '');
  const { mutateAsync: deletePhotoAsync } = useDeleteExperiencePhoto();

  const handleAddPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (!files) return;

    if (localPhotos.length + files.length > maxPhotos) {
      toast({
        title: 'Too many photos',
        description: `You can upload a maximum of ${maxPhotos} photos.`,
        variant: 'destructive',
      });
      return;
    }

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setLocalPhotos((prev) => [...prev, { photo: result, file }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemovePhoto = async (index: number) => {
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
      console.error('[PhotoEditPanel] Error:', error);
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

      <div className="grid grid-cols-3 gap-2">
        {localPhotos.map((photo, index) => (
          <div key={index} className="relative aspect-square rounded-lg bg-gray-100">
            <img
              src={photo}
              alt={`Photo ${index + 1}`}
              className="h-full w-full rounded-lg object-cover"
            />
            <button
              type="button"
              onClick={() => handleRemovePhoto(index)}
              disabled={isLoading}
              className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="text-sm">×</span>
            </button>
          </div>
        ))}

        {localPhotos.length < maxPhotos && (
          <label className="flex aspect-square cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleAddPhoto}
              className="hidden"
            />
            <div className="text-center">
              <IconComponent iconName="Upload01Icon" size={24} className="mx-auto text-gray-400" />
              <p className="mt-1 text-xs text-gray-600">Add photos</p>
            </div>
          </label>
        )}
      </div>

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isLoading}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="button"
          variant="gradient"
          onClick={handleSave}
          disabled={isLoading}
          className="flex-1"
        >
          {isLoading ? 'Saving...' : 'Save Photos'}
        </Button>
      </div>
    </div>
  );
};
