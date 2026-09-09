'use client';

import { useState } from 'react';

import { useSession } from 'next-auth/react';

import { AddReview } from '@/app/(places)/components/Review/AddReview';
import { IconComponent } from '@/app/shared/components/Icons';
import {
  useCreatePlaceReview,
  useDeletePlaceReviewImage,
  useUploadPlaceReviewImages,
} from '@/app/shared/hooks/usePlaces';
import { Button } from '@/components/ui/button';
import { useAuthDialog } from '@/context/AuthDialogContext';

/**
 * Writing a review, from the reviews section's own header.
 *
 * Everything here already existed — the {@link AddReview} drawer, the create
 * and photo-upload hooks — it simply had no entry point on the redesigned
 * place page. Photos upload against the review the create call returns, which
 * the drawer sequences itself.
 */
export const AddPlaceReviewAction = ({
  placeId,
  placeTitle,
}: {
  placeId: string;
  placeTitle: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession();
  const { setOpenSignIn } = useAuthDialog();

  const { mutate: createPlaceReview, isSuccess, isPending: isSubmitting } = useCreatePlaceReview();
  const { mutate: uploadPlaceReviewImages, isSuccess: isUploadSuccess } =
    useUploadPlaceReviewImages();
  const { mutate: deletePlaceReviewImage } = useDeletePlaceReviewImage();

  return (
    <>
      <Button
        variant="outline"
        onClick={() => {
          // Reviewing needs an account; the dialog returns them here rather
          // than to a sign-in page they have to navigate back from
          if (!session?.user?.id) {
            setOpenSignIn(true);
            return;
          }

          setIsOpen(true);
        }}
        className="flex-shrink-0 rounded-full px-5"
      >
        <IconComponent iconName="StarIcon" size={16} color="currentColor" />
        Write a review
      </Button>

      <AddReview
        type="create"
        id={placeId}
        isOpen={isOpen}
        placeTitle={placeTitle}
        closeModal={() => setIsOpen(false)}
        review={undefined}
        createReview={(data: unknown) => createPlaceReview({ placeId, data })}
        updateReview={undefined}
        uploadReviewImages={(reviewId: string, data: unknown) =>
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
};
