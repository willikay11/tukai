'use client';

import {
  useDeletePlaceReview,
  useDeletePlaceReviewImage,
  useLikePlaceReview,
  usePlaceReviews,
  useUpdatePlaceReview,
  useUploadPlaceReviewImages,
} from '@/hooks/places';
import Review from '@/app/components/review';
import { Review as ReviewType } from '@/types/review';
import NoData from '@/components/ui/noData';

type placeReviewsProps = {
  placeId: string;
};

export default function Reviews({ placeId }: placeReviewsProps) {
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
    return (
      <div className="my-2">
        <NoData message="No reviews" />
      </div>
    );
  }

  return reviews?.data?.results?.map((review: ReviewType) => (
    <Review
      key={review.id}
      id={placeId}
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
}
