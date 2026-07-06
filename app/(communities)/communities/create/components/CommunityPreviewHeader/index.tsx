'use client';

import Image from 'next/image';

interface CommunityPreviewHeaderProps {
  photo: string | null;
  name: string;
  description: string;
}

export const CommunityPreviewHeader = ({
  photo,
  name,
  description,
}: CommunityPreviewHeaderProps) => {
  return (
    <div className="space-y-3">
      {/* Photo strip */}
      {photo && (
        <div className="relative h-32 w-full overflow-hidden rounded-lg bg-gray-100">
          <Image
            src={photo}
            alt={name}
            fill
            sizes="300px"
            className="object-cover"
          />
        </div>
      )}

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
