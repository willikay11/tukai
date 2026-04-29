'use client';

import { Photo } from '@/types/photo';

export interface ReviewPhotoGalleryProps {
  photos?: Photo[];
}

export const ReviewPhotoGallery = ({ photos }: ReviewPhotoGalleryProps) => {
  if (!photos || photos.length === 0) {
    return null;
  }

  // Show up to 7 photos in a grid layout
  const displayPhotos = photos.slice(0, 7);

  return (
    <div className="mt-4 grid grid-cols-3 gap-2">
      {displayPhotos.map((photo, index) => (
        <div key={photo.id || index} className="aspect-square overflow-hidden rounded-lg">
          <img
            src={photo.photo}
            alt={`Experience photo ${index + 1}`}
            className="h-full w-full object-cover"
          />
        </div>
      ))}
    </div>
  );
};
