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
        const file = files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
          const dataUrl = e.target?.result as string;
          onPhotoChange(dataUrl);
        };
        reader.readAsDataURL(file);
      }
    },
    [onPhotoChange],
  );

  const initialUrls = photoUrl ? [photoUrl] : [];

  return (
    <div className="space-y-2">
      <FileUploadField
        id="experience-photo"
        label="Add details about the experience"
        buttonText="Add Photo(s)"
        accept="image/*"
        multiple={false}
        maxFiles={1}
        minImageWidth={540}
        minImageHeight={540}
        initialUrls={initialUrls}
        onFilesChange={handleFilesChange}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
      <p className="text-xs text-gray-500">Upload experience poster (Dimensions: 540 x 540, 16:9 Ratio)</p>
    </div>
  );
};
