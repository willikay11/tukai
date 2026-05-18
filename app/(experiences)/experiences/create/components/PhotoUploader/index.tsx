'use client';

import { useCallback } from 'react';

import { FileUploadField } from '@/app/shared/components/Forms';

interface PhotoUploaderProps {
  photoUrl: string | null;
  onPhotoChange: (url: string | null) => void;
  error?: string;
}

export const PhotoUploader = ({ photoUrl, onPhotoChange, error }: PhotoUploaderProps) => {
  const handleFilesChange = useCallback(
    (files: File[]) => {
      if (files.length > 0) {
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
    [onPhotoChange],
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
