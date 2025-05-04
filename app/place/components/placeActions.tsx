'use client';

import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Share from '@/app/components/share';
import { useBookmarkPlace, useCreatePlaceReview, useDeletePlaceReviewImage, useUploadPlaceReviewImages } from '@/hooks/places';
import Bookmark from '@/app/components/bookmark';
import AddReview from '@/app/components/review/AddReview';

export default function PlaceActions({
  placeId,
  bookmarked,
  placeTitle,
  coverPhoto,
}: {
  placeId: string;
  bookmarked: boolean;
  placeTitle: string;
  coverPhoto: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession();

  const {
    mutate: createPlaceReview,
    isSuccess,
    data: reviewData,
    isPending,
  } = useCreatePlaceReview();
  const { mutate: uploadPlaceReviewImages, isSuccess: isUploadSuccess } = useUploadPlaceReviewImages();
  const { mutate: deletePlaceReviewImage, isSuccess: isDeleteReviewImageSuccess } = useDeletePlaceReviewImage();
  const { mutate: bookmarkPlace } = useBookmarkPlace(placeId, session?.user?.id || '');

  return (
    <>
      <div className="inline-flex h-full items-center justify-center">
        {session?.user?.id && (
          <Bookmark
            bookmarked={bookmarked}
            onBookmark={() => bookmarkPlace()}
            onUnbookmark={() => bookmarkPlace()}
          />
        )}
        <div className="mx-2 h-[8px] w-[1px] rounded bg-gray-300" />
        <Share
          coverPhoto={coverPhoto}
          title={placeTitle}
          link={`${process.env.NEXT_PUBLIC_APP_URL}/places/${placeId}`}
        />
        <div className="mr-2" />
        <Button onClick={() => setIsOpen(true)}>Add Review</Button>
      </div>

      <AddReview
        type="create"
        id={placeId}
        isOpen={isOpen}
        placeTitle={placeTitle}
        closeModal={() => setIsOpen(false)}
        review={reviewData?.data}
        createReview={(data: any) => createPlaceReview({ placeId, data })}
        updateReview={undefined}
        uploadReviewImages={(reviewId: string, data: any) => uploadPlaceReviewImages({ placeId, reviewId, data })}
        deleteReviewImage={(reviewId: string, imageId: string) => deletePlaceReviewImage({ placeId, reviewId, imageId })}
        isSuccess={isSuccess}
        isUpdateSuccess={undefined}
        isUploadSuccess={isUploadSuccess}
        isPending={isPending}
        isUpdatePending={undefined}
      />  
    </>
  );
}
