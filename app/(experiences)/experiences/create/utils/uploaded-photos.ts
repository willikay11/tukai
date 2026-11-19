import { Photo } from '@/types/photo';

type LocalPhoto = { id: string; file?: File };

/**
 * Which server photo each just-uploaded local photo became. The API names a
 * new photo after its file (`caption`), so that's matched first; failing
 * that, by position, but only when the counts agree. A photo with no match
 * maps to undefined.
 *
 * `known` are the photo ids the form already had, so photos the experience
 * had before aren't mistaken for new ones.
 */
export const matchUploadedPhotos = (
  pending: LocalPhoto[],
  serverPhotos: Photo[],
  known: Set<string>,
): Map<string, Photo | undefined> => {
  const fresh = serverPhotos.filter((photo) => !known.has(photo.id));
  const byPosition = fresh.length === pending.length ? [...fresh] : null;
  const unclaimed = [...fresh];
  const matches = new Map<string, Photo | undefined>();

  pending.forEach((photo, index) => {
    const byName = unclaimed.find((server) => server.caption === photo.file?.name);
    const match = byName ?? byPosition?.[index];
    if (match && unclaimed.includes(match)) {
      unclaimed.splice(unclaimed.indexOf(match), 1);
      matches.set(photo.id, match);
    } else {
      matches.set(photo.id, undefined);
    }
  });

  return matches;
};
