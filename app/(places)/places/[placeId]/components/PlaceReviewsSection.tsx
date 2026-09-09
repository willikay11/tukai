'use client';

import { Reviews } from '@/app/(places)/places/components/reviews';
import { Rating } from '@/app/shared/components/Rating/Rating';
import { SectionShell } from '@/app/shared/components/Sections';

import { AddPlaceReviewAction } from './AddPlaceReviewAction';

export const PlaceReviewsSection = ({
  placeId,
  placeTitle,
  rating,
  reviewCount,
}: {
  placeId: string;
  placeTitle: string;
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
    // In the header, so it is there whether or not the place has reviews yet —
    // the list below returns early with its empty state
    action={<AddPlaceReviewAction placeId={placeId} placeTitle={placeTitle} />}
  >
    {/* Already wired for photos, likes and comments — see app/(places)/components/Review */}
    <Reviews placeId={placeId} />
  </SectionShell>
);
