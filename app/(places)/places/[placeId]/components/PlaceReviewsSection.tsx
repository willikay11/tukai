'use client';

import { Reviews } from '@/app/(places)/places/components/reviews';
import { Rating } from '@/app/shared/components/Rating/Rating';
import { SectionShell } from '@/app/shared/components/Sections';

export const PlaceReviewsSection = ({
  placeId,
  rating,
  reviewCount,
}: {
  placeId: string;
  rating: number;
  reviewCount: number | null;
}) => (
  <SectionShell
    id="reviews"
    title="Reviews"
    subtitle={
      rating > 0 ? (
        <span className="flex items-center gap-1">
          <Rating rating={rating} showCount />
          {reviewCount ? `· ${reviewCount} Reviews` : null}
        </span>
      ) : undefined
    }
  >
    {/* Already wired for photos, likes and comments — see app/(places)/components/Review */}
    <Reviews placeId={placeId} />
  </SectionShell>
);
