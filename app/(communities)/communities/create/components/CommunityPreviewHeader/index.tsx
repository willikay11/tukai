'use client';

import { SquarePhotoStrip } from '@/app/shared/components/Images/SquarePhotoStrip';

interface CommunityPreviewHeaderProps {
  photos: string[];
  name: string;
  description: string;
}

export const CommunityPreviewHeader = ({
  photos,
  name,
  description,
}: CommunityPreviewHeaderProps) => {
  return (
    <div className="space-y-3">
      {/* Photo strip */}
      {photos.length > 0 && <SquarePhotoStrip photos={photos} />}

      {/* Name and description */}
      <div>
        <h3 className="text-base font-bold text-gray-900">{name}</h3>
        {description && (
          <p className="mt-1 text-xs leading-relaxed text-gray-600">{description}</p>
        )}
      </div>
    </div>
  );
};
