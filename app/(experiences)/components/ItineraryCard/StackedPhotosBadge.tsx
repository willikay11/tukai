import Image from 'next/image';

// A small pile of preview photos, overlapped like a stack of prints
export const StackedPhotosBadge = ({
  photos,
  className = '',
}: {
  photos: string[];
  className?: string;
}) => {
  const visible = photos.slice(0, 3);
  if (visible.length === 0) return null;

  return (
    <div className={`flex items-center -space-x-2 ${className}`}>
      {visible.map((photo, index) => (
        <div
          key={`${photo}-${index}`}
          className="relative h-9 w-9 overflow-hidden rounded-lg bg-gray-200 ring-2 ring-white"
        >
          <Image src={photo} alt="" fill sizes="36px" className="object-cover" />
        </div>
      ))}
    </div>
  );
};
