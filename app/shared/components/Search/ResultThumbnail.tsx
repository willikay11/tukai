import { PhotoImage } from '@/app/shared/components/Images';
import { Photo, coverPhotoUrl } from '@/types/photo';

/**
 * The 56px cover every search result row leads with. Lifted out of the rows so
 * the three of them cannot drift apart.
 */
export const ResultThumbnail = ({ photos, alt }: { photos?: Photo[]; alt: string }) => {
  const cover = coverPhotoUrl(photos, 'thumb');

  return (
    <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100">
      <PhotoImage src={cover} alt={alt} fill sizes="56px" className="object-cover" />
    </div>
  );
};
