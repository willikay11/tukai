import { Rating } from '@/app/shared/components/Rating/Rating';
import { Place } from '@/types/place';
import { PlaceCategory } from '@/types/placeCategory';

import { ResultThumbnail } from './ResultThumbnail';

export const PlaceResultRow = ({ item, onClick }: { item: Place; onClick: () => void }) => {
  // Categories mix city and interest groups — only the interest one names the
  // kind of place ("Restaurants"); the city ones repeat the area
  const category = item.categories?.find(
    (entry: PlaceCategory) => entry.group === 'interests',
  )?.name;
  const area = item.location?.city || item.location?.name;
  const metaLine = [category, area].filter(Boolean).join(' · ');

  // Most places have no reviews yet, so 0 means "unrated" rather than a score
  const rating = item.averageRating > 0 ? item.averageRating : null;

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl p-2 text-left transition-colors hover:bg-gray-50"
    >
      <ResultThumbnail photos={item.photos} alt={item.title} />

      <div className="min-w-0 flex-1">
        <p className="truncate text-base font-bold text-gray-900">{item.title}</p>
        {rating !== null && (
          <span className="mt-0.5 flex items-center gap-1 text-sm text-gray-600">
            <Rating rating={rating} showCount />
          </span>
        )}
        {metaLine && <p className="mt-0.5 truncate text-sm text-gray-400">{metaLine}</p>}
      </div>
    </button>
  );
};
