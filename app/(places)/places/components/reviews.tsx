'use client';

import { Review } from '@/app/(places)/components/Review';
import {
  useDeletePlaceReview,
  useDeletePlaceReviewImage,
  useLikePlaceReview,
  usePlaceReviews,
  useUpdatePlaceReview,
  useUploadPlaceReviewImages,
} from '@/app/shared/hooks/usePlaces';
import { NoData } from '@/components/ui/noData';
import { Review as ReviewType } from '@/types/review';

type placeReviewsProps = {
  placeId: string;
  /** 'panel' is the place drawer's list: full-bleed rows and its own empty line. */
  variant?: 'default' | 'panel';
};

export const Reviews = ({ placeId, variant = 'default' }: placeReviewsProps) => {
  const { data: reviews, isLoading } = usePlaceReviews(placeId);
  const { mutate: likeReview } = useLikePlaceReview();
  const { mutate: deleteReview, isPending: isDeletingReview } = useDeletePlaceReview();
  const {
    mutate: updatePlaceReview,
    isSuccess: isUpdateSuccess,
    isPending: isUpdatePending,
  } = useUpdatePlaceReview();

  const { mutate: uploadPlaceReviewImages, isSuccess: isUploadSuccess } =
    useUploadPlaceReviewImages();
  const { mutate: deletePlaceReviewImage, isSuccess: isDeleteReviewImageSuccess } =
    useDeletePlaceReviewImage();

  if (reviews?.data?.results?.length === 0 && !isLoading) {
    if (variant === 'panel') {
      return (
        <p className="text-sm leading-normal text-ink-muted">
          No reviews yet. If you have been, yours would be the first.
        </p>
      );
    }
    return (
      <div className="my-2 w-full items-center justify-center">
        <NoData message="No reviews" />
      </div>
    );
  }

  return reviews?.data?.results?.map((review: ReviewType) => (
    <Review
      key={review.id}
      id={placeId}
      variant={variant}
      review={review}
      likeReview={() => {
        likeReview({ placeId, reviewId: review.id });
      }}
      deleteReview={() => {
        deleteReview({ placeId, reviewId: review.id });
      }}
      isDeletingReview={isDeletingReview}
      updateReview={(data: any) => {
        updatePlaceReview({ placeId, reviewId: review.id, data });
      }}
      uploadReviewImages={(data: any) => {
        uploadPlaceReviewImages({ placeId, reviewId: review.id, data });
      }}
      deleteReviewImage={(reviewId: string, imageId: string) => {
        deletePlaceReviewImage({ placeId, reviewId, imageId });
      }}
      isUpdateSuccess={isUpdateSuccess}
      isUploadSuccess={isUploadSuccess}
      isUpdatePending={isUpdatePending}
    />
  ));
};
