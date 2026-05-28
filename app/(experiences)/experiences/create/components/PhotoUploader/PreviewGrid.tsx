'use client';

import Image from 'next/image';

import { IconComponent } from '@/app/shared/components/Icons';

interface PreviewGridProps {
  previews: Array<{ url: string; index: number; id: string }>;
  onRemove: (index: number) => void;
  onAddClick: () => void;
  maxFiles?: number;
  isDeletingPhoto?: boolean;
}

export const PreviewGrid = ({
  previews,
  onRemove,
  onAddClick,
  maxFiles = 6,
  isDeletingPhoto = false,
}: PreviewGridProps) => {
  const isExternalUrl = (src: string) => src.startsWith('https://') || src.startsWith('http://');
  const hasReachedMax = maxFiles && previews.length >= maxFiles;

  return (
    <div className="flex flex-wrap items-start gap-3">
      {previews.map(({ url, index, id }) => (
        <div
          key={id}
          className="relative h-[105px] w-[155px] rounded-xl"
        >
          {isExternalUrl(url) ? (
            <Image
              src={url}
              alt={`Preview ${index + 1}`}
              fill
              sizes="155px"
              className="rounded-xl object-cover"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={url}
              alt={`Preview ${index + 1}`}
              className="h-full w-full rounded-xl object-cover"
            />
          )}

          <button
            type="button"
            onClick={() => {
              onRemove(index);
            }}
            disabled={isDeletingPhoto}
            className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-gray-700/70 text-white transition-colors hover:bg-gray-800/80 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Remove image"
          >
            <IconComponent iconName="Cancel01Icon" color="#FFFFFF" size={18} />
          </button>

          <span className="absolute bottom-2 left-2 flex h-8 w-8 items-center justify-center rounded-full bg-gray-700/70 text-base font-medium text-white">
            {index + 1}
          </span>
        </div>
      ))}

      {!hasReachedMax && (
        <button
          type="button"
          onClick={onAddClick}
          className="inline-flex h-[105px] w-[155px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-emerald-500/50 bg-emerald-50/50 text-center hover:border-emerald-600 hover:bg-emerald-100/50"
        >
          <IconComponent iconName="ImageAdd02Icon" color="#10B981" size={20} />
          <span className="mt-1 text-[10px] font-medium text-emerald-700">Add Photo(s)</span>
        </button>
      )}
    </div>
  );
};
