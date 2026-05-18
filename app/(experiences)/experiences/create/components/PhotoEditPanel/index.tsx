'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { IconComponent } from '@/app/shared/components/Icons';
import { useToast } from '@/app/shared/hooks/useToast';

interface PhotoEditPanelProps {
  photos: string[];
  onPhotosChange: (photos: string[]) => void;
  onClose: () => void;
  maxPhotos?: number;
}

export const PhotoEditPanel = ({
  photos,
  onPhotosChange,
  onClose,
  maxPhotos = 9,
}: PhotoEditPanelProps) => {
  const [localPhotos, setLocalPhotos] = useState<string[]>(photos);
  const { toast } = useToast();

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
        setLocalPhotos((prev) => [...prev, result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemovePhoto = (index: number) => {
    setLocalPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    onPhotosChange(localPhotos);
    onClose();
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-900">Edit Photos</h3>
        <p className="mt-1 text-xs text-gray-600">
          You can upload up to {maxPhotos} photos
        </p>
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
              className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600"
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
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="button"
          variant="gradient"
          onClick={handleSave}
          className="flex-1"
        >
          Save Photos
        </Button>
      </div>
    </div>
  );
};
