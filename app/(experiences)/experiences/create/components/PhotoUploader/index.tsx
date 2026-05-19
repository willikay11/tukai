'use client';

import { useCallback } from 'react';

import { FileUploadField } from '@/app/shared/components/Forms';

interface PhotoUploaderProps {
  photoUrl: string | null;
  onPhotoChange: (url: string | null) => void;
  onPhotoFilesChange?: (files: File[]) => void;
  error?: string;
}

export const PhotoUploader = ({ photoUrl, onPhotoChange, onPhotoFilesChange, error }: PhotoUploaderProps) => {
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

  const initialUrls = photoUrl ? [photoUrl] : [];

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
        onFilesChange={handleFilesChange}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};
