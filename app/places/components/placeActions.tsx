'use client';

import { useState } from 'react';

import { useSession } from 'next-auth/react';

import { Bookmark } from '@/app/components/bookmark';
import { AddReview } from '@/app/components/review/AddReview';
import { Share } from '@/app/components/share';
import { Button } from '@/components/ui/button';
import { useAuthDialog } from '@/context/AuthDialogContext';
import {
  useBookmarkPlace,
  useCreatePlaceReview,
  useDeletePlaceReviewImage,
  useUploadPlaceReviewImages,
} from '@/hooks/places';

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
  const { setOpenSignIn } = useAuthDialog();
  const { data: session } = useSession();

  const {
    mutate: createPlaceReview,
    isSuccess,
    data: reviewData,
    isPending: isSubmitting,
  } = useCreatePlaceReview();
  const { mutate: uploadPlaceReviewImages, isSuccess: isUploadSuccess } =
    useUploadPlaceReviewImages();
  const { mutate: deletePlaceReviewImage, isSuccess: isDeleteReviewImageSuccess } =
    useDeletePlaceReviewImage();
  const { mutate: bookmarkPlace } = useBookmarkPlace(placeId, session?.user?.id || '');

  return (
    <>
      <div className="inline-flex h-full items-center justify-center">
        <Bookmark
          userId={session?.user?.id}
          bookmarked={bookmarked}
          onBookmark={() => bookmarkPlace()}
          onUnbookmark={() => bookmarkPlace()}
          className="text-primary"
        />
        <div className="mx-2 h-[8px] w-[1px] rounded bg-gray-300" />
        <Share
          coverPhoto={coverPhoto}
          title={placeTitle}
          link={`Check out this place ${placeTitle} on Tukai, ${process.env.NEXT_PUBLIC_APP_URL}/places/${placeId}`}
        />
        <div className="mr-2" />
        <Button
          onClick={() => {
            if (!session?.user?.id) {
              setOpenSignIn(true);
            } else {
              setIsOpen(true);
            }
          }}
        >
          Add Review
        </Button>
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
        uploadReviewImages={(reviewId: string, data: any) =>
          uploadPlaceReviewImages({ placeId, reviewId, data })
        }
        deleteReviewImage={(reviewId: string, imageId: string) =>
          deletePlaceReviewImage({ placeId, reviewId, imageId })
        }
        isSuccess={isSuccess}
        isUpdateSuccess={undefined}
        isUploadSuccess={isUploadSuccess}
        isSubmitting={isSubmitting}
        isUpdatePending={undefined}
      />
    </>
  );
}
