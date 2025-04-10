'use client';

import { usePlaceReviews } from '@/hooks/places';
import Review from './review';
import { PlaceReview } from '@/types/place';
import NoData from '@/components/ui/noData';

type placeReviewsProps = {
  placeId: string;
};

export default function Reviews({ placeId }: placeReviewsProps) {
  const { data: reviews, isLoading } = usePlaceReviews(placeId);

  if (reviews?.data?.results?.length === 0 && !isLoading) {
    return (
      <div className="my-2">
        <NoData message="No reviews" />
      </div>
    );
  }
  return reviews?.data?.results?.map((review: PlaceReview) => (
    <Review key={review.id} placeId={placeId} review={review} />
  ));
}
