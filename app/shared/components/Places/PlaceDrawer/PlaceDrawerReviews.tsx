'use client';

import { Reviews } from '@/app/(places)/places/components/reviews';
import { IconComponent } from '@/app/shared/components/Icons';

/**
 * The place drawer's Reviews section: a 19px heading, the place's rating and
 * count on the right, then the list in the drawer's own row style.
 *
 * The place page keeps PlaceReviewsSection. Its row is shared with other
 * surfaces, so the drawer draws its own heading and passes the panel variant
 * down rather than changing that page.
 */
export const PlaceDrawerReviews = ({
  placeId,
  rating,
  reviewCount,
}: {
  placeId: string;
  rating: number;
  reviewCount: number | null;
}) => {
  const count = reviewCount ?? 0;
  const hasRating = rating > 0;

  return (
    <div className="flex flex-col">
      <div className="mb-1.5 flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
        <h3 className="text-19 font-bold text-gray-800">Reviews</h3>

        <span className="flex items-center gap-[7px] whitespace-nowrap text-[14.5px] text-gray-800">
          {hasRating && (
            <>
              <IconComponent
                iconName="StarIcon"
                variant="bulk"
                size={18}
                color="currentColor"
                className="flex-shrink-0 text-star"
              />
              <span className="font-semibold">{rating.toFixed(1)}</span>
              <span
                aria-hidden="true"
                className="h-[5px] w-[5px] flex-shrink-0 rounded-full bg-distance"
              />
            </>
          )}
          {count > 0
            ? `${count.toLocaleString('en-US')} ${count === 1 ? 'review' : 'reviews'}`
            : 'No reviews yet'}
        </span>
      </div>

      <Reviews placeId={placeId} variant="panel" />
    </div>
  );
};
