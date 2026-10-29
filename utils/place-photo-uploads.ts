import { Photo, photoUrl } from '@/types/photo';

const ANCHOR_PHOTO_LIMIT = 3;
const FALLBACK_MIME_TYPE = 'image/jpeg';

const downloadAsFile = async (url: string, index: number): Promise<File | null> => {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;

    const blob = await response.blob();
    const type = blob.type.startsWith('image/') ? blob.type : FALLBACK_MIME_TYPE;

    return new File([blob], `reservation-anchor-${index}.${type.replace('image/', '')}`, { type });
  } catch {
    return null;
  }
};

export const placePhotosAsUploads = async (photos: Photo[]): Promise<File[]> => {
  const urls = photos
    .filter((photo) => photo.mediaType !== 'video')
    .sort((first, second) => (first.order ?? 0) - (second.order ?? 0))
    .slice(0, ANCHOR_PHOTO_LIMIT)
    .map((photo) => photoUrl(photo, 'lg'))
    .filter((url): url is string => Boolean(url));

  const files = await Promise.all(urls.map(downloadAsFile));

  return files.filter((file): file is File => file !== null);
};
