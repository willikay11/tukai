export type Photo = {
  id: string;
  mediaType: 'photo' | 'video';
  experience?: string;
  photo?: string;
  caption?: string;
  isCover?: boolean;
  order?: number;
  /**
   * Pre-rendered sizes the API generates alongside the upload. All four can be
   * null — most of the library predates them — so every read falls back to the
   * original, which is always there.
   *
   * `photo` and `photo_url` are the same original file under two names.
   */
  photoUrl?: string | null;
  photoWebpLgUrl?: string | null;
  photoWebpMdUrl?: string | null;
  photoWebpThumbUrl?: string | null;
};

export type PhotoItem = { type: 'existing'; id: string; url: string } | { type: 'new'; file: File };

/**
 * Which rendition a surface wants:
 *  - `thumb` — avatars, search rows, strips: roughly 100px wide
 *  - `md`    — cards in a grid or a scroll row: roughly 300–400px wide
 *  - `lg`    — heroes and detail galleries: full width
 */
export type PhotoSize = 'thumb' | 'md' | 'lg';

/** What each size falls back to. Only ever upwards: a request for `md` may be
 *  served the large file or the original, but never the thumbnail — a blurred
 *  card is worse than a slow one. The original ends every chain. */
const FALLBACKS: Record<PhotoSize, (keyof Photo)[]> = {
  thumb: ['photoWebpThumbUrl', 'photoWebpMdUrl', 'photoWebpLgUrl', 'photoUrl', 'photo'],
  md: ['photoWebpMdUrl', 'photoWebpLgUrl', 'photoUrl', 'photo'],
  lg: ['photoWebpLgUrl', 'photoUrl', 'photo'],
};

/**
 * The best URL for a photo at the size a surface actually renders it.
 *
 * `next/image` runs with `unoptimized: true`, so it neither resizes nor
 * re-encodes anything: whatever URL goes in is what the browser downloads.
 * These renditions are the only size lever the app has, which is why this is
 * worth reading for rather than taking `photo` everywhere.
 */
export const photoUrl = (photo: Photo | null | undefined, size: PhotoSize = 'md') => {
  if (!photo) return undefined;

  for (const key of FALLBACKS[size]) {
    const value = photo[key];
    if (typeof value === 'string' && value !== '') return value;
  }

  return undefined;
};

/**
 * The cover of a set, at the size asked for.
 *
 * Falls back to the first photo: a set whose photos carry no `is_cover` flag
 * would otherwise show nothing, which is what used to happen on the booking
 * confirmation.
 */
export const coverPhotoUrl = (
  photos: Photo[] | null | undefined,
  size: PhotoSize = 'md',
): string | undefined => {
  if (!photos?.length) return undefined;

  return photoUrl(photos.find((photo) => photo.isCover) ?? photos[0], size);
};
