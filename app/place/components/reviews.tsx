'use client';

import Rating from '@/app/components/rating';
import { Button } from '@/components/ui/button';
import { Message02Icon, MoreHorizontalCircle01Icon, FavouriteIcon } from '@hugeicons/react-pro';
import { Separator } from '@radix-ui/react-separator';
import Image from 'next/image';
import { usePlaceReviews } from '@/hooks/places';
import Review from './review';
import { PlaceReview } from '@/types/place';

type placeReviewsProps = {
  placeId: string;
};

export default function Reviews({ placeId }: placeReviewsProps) {
  const { data: reviews } = usePlaceReviews(placeId);

  return reviews?.data?.results?.map((review: PlaceReview) => (
    <Review key={review.id} placeId={placeId} review={review} />
  ));
}
