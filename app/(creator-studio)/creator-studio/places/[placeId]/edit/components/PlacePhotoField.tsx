'use client';

import { useEffect, useRef, useState } from 'react';

import Image from 'next/image';

import { IconComponent } from '@/app/shared/components/Icons';
import { useToast } from '@/app/shared/hooks/useToast';
import { validateExperienceImage } from '@/utils/image-utils';

import { EditPhoto } from '../schemas';

const MAX_PHOTOS = 15;

/**
 * The place's photos, as the owner manages them.
 *
 * Kept apart from the shared experience uploader: that one is built around a
 * single square poster — its copy, its 6-photo cap and its delete call all name
 * experiences — where a place carries a gallery. What is worth sharing is the
 * validation, so that comes from the same helper.
 *
 * Which photo is the cover is shown but not editable. The API sets `is_cover`
 * as a photo is created and offers no way to move it afterwards, so a control
 * for it here would not survive a save.
 */
export const PlacePhotoField = ({
  photos,
  onChange,
  error,
}: {
  photos: EditPhoto[];
  onChange: (photos: EditPhoto[]) => void;
  error?: string;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  // Object URLs are revoked on unmount, not on every render, or a preview would
  // go blank the moment anything else in the form changed
  const [blobUrls, setBlobUrls] = useState<string[]>([]);

  useEffect(() => () => blobUrls.forEach((url) => URL.revokeObjectURL(url)), [blobUrls]);

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList?.length) return;

    const room = MAX_PHOTOS - photos.length;
    const files = Array.from(fileList).slice(0, room);

    if (files.length < fileList.length) {
      toast({
        title: 'Some photos were not added',
        description: `A place can hold ${MAX_PHOTOS} photos.`,
      });
    }

    const accepted: EditPhoto[] = [];

    for (const file of files) {
      const result = await validateExperienceImage(file);

      if (!result.valid) {
        toast({ title: file.name, description: result.error, variant: 'destructive' });
        continue;
      }
      if (result.warning) {
        toast({ title: file.name, description: result.warning });
      }

      const url = URL.createObjectURL(file);
      setBlobUrls((current) => [...current, url]);
      accepted.push({ id: `new-${Date.now()}-${accepted.length}`, url, file });
    }

    if (accepted.length) onChange([...photos, ...accepted]);
    // Picking the same file twice in a row should still register
    if (inputRef.current) inputRef.current.value = '';
  };

  // Whichever photo the API flagged, and the first one when it flagged none
  const coverId = photos.find((photo) => photo.isCover)?.id ?? photos[0]?.id;

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-gray-800">
        Upload a few photos of the place{' '}
        <span className="text-muted-foreground">(Dimensions: 540*540, Max 10 MB)</span>
      </p>

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="relative aspect-square overflow-hidden rounded-2xl bg-gray-100"
          >
            {photo.file ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photo.url} alt="" className="h-full w-full object-cover" />
            ) : (
              <Image src={photo.url} alt="" fill sizes="240px" className="object-cover" />
            )}

            <button
              type="button"
              onClick={() => onChange(photos.filter((entry) => entry.id !== photo.id))}
              aria-label="Remove photo"
              className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-gray-800/60 text-white transition hover:bg-gray-900/70"
            >
              <IconComponent iconName="Cancel01Icon" color="#FFFFFF" size={16} />
            </button>

            {photo.id === coverId && (
              <span className="absolute bottom-2 left-2 flex items-center gap-1 rounded-lg bg-primary px-2 py-1 text-xs font-medium text-white">
                <IconComponent iconName="StarIcon" color="currentColor" size={12} />
                Cover
              </span>
            )}
          </div>
        ))}

        {photos.length < MAX_PHOTOS && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex aspect-square flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-primary/40 bg-green-50 text-primary transition hover:bg-green-100"
          >
            <IconComponent iconName="ImageAdd02Icon" color="currentColor" size={26} />
            <span className="text-sm font-medium">Add Photo(s)</span>
          </button>
        )}
      </div>

      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        aria-label="Add photos"
        onChange={(event) => handleFiles(event.target.files)}
      />
    </div>
  );
};
