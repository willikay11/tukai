'use client';

import Rating from '@/app/components/rating';
import { Button } from '@/components/ui/button';
import { FavouriteIcon, Message02Icon } from '@hugeicons/react-pro';
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';
import { Review as ReviewType } from '@/types/review';
import moment from 'moment';
import ImageCarousel from '@/components/ui/imageCarousel';
import { Photo } from '@/types/photo';
import IconComponent from '@/app/components/iconComponent';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import AddReview from './AddReview';
import AddReviewComment from './AddReviewComment';

export default function Review({
  id,
  review,
  likeReview,
  deleteReview,
  isDeletingReview,
  updateReview,
  uploadReviewImages,
  deleteReviewImage,
  isUpdateSuccess,
  isUploadSuccess,
  isUpdatePending,
}: {
  id: string;
  review: ReviewType;
  likeReview: () => void;
  deleteReview: () => void;
  updateReview: (data: any) => void;
  uploadReviewImages: (data: any) => void;
  deleteReviewImage: (reviewId: string, imageId: string) => void;
  isDeletingReview: boolean;
  isUpdateSuccess: boolean;
  isUploadSuccess: boolean;
  isUpdatePending: boolean;
}) {
  const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
  const [isLiked, setIsLiked] = useState(false);
  const { data: session } = useSession();

  const handleLikeReview = () => {
    setIsLiked(!isLiked);
    likeReview();
  };

  const handleDeleteReview = () => {
    deleteReview();
  };

  useEffect(() => {
    setIsLiked(review.isLiked);
  }, [review]);

  return (
    <>
      <AddReviewComment
        id={id}
        reviewId={review.id}
        isOpen={isOpen}
        closeModal={() => setIsOpen(false)}
      />
      <AddReview
        type="update"
        id={id}
        isOpen={isEditOpen}
        placeTitle={review.title}
        closeModal={() => setIsEditOpen(false)}
        review={review}
        updateReview={updateReview}
        uploadReviewImages={uploadReviewImages}
        deleteReviewImage={deleteReviewImage}
        isUpdateSuccess={isUpdateSuccess}
        isUploadSuccess={isUploadSuccess}
        isUpdatePending={isUpdatePending}
        createReview={undefined}
        isSuccess={undefined}
        isPending={undefined}
      />

      <div className="flex flex-col">
        <div className="flex w-full items-center justify-between">
          <div className="inline-flex">
            <div className="relative mr-2 flex aspect-square h-10 w-10 flex-col">
              <Image
                src={review.reviewer.picture}
                alt={review.reviewer.displayName}
                className="h-10 w-10 rounded-full"
                quality={100}
                layout="fill"
                objectFit="cover"
              />
            </div>
            <div className="ml-1">
              <div className="font-bold text-gray-700">{review.reviewer.displayName}</div>
              <div className="inline-flex items-center">
                <Rating rating={review.rating} />
                <div className="mx-1 h-1 w-1 rounded-full bg-gray-200" />
                <span className="text-sm text-gray-500">
                  {moment(review.dateCreated).format('MMM YYYY')}
                </span>
              </div>
            </div>
          </div>
          {review.reviewer.id === session?.user?.id && (
            <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
              <PopoverTrigger asChild>
                <Button variant="text">
                  <IconComponent iconName="MoreHorizontalCircle01Icon" size={20} />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="flex h-fit w-fit flex-col gap-2 rounded-[15px] border-gray-200 shadow-md">
                <Button
                  variant="text"
                  className="h-fit justify-start p-0"
                  onClick={() => {
                    setIsPopoverOpen(false);
                    setIsEditOpen(true);
                  }}
                >
                  <IconComponent iconName="Edit02Icon" size={20} color="green" />
                  Edit Review
                </Button>
                <Button
                  variant="text"
                  className="h-fit justify-start p-0"
                  onClick={handleDeleteReview}
                  disabled={isDeletingReview}
                >
                  <IconComponent iconName="Delete04Icon" size={20} color="red" />
                  {isDeletingReview ? 'Deleting...' : 'Delete Review'}
                </Button>
              </PopoverContent>
            </Popover>
          )}
        </div>
        {review.photos.length > 0 && (
          <div className="mt-2 w-full">
            <ImageCarousel
              imageHeight="h-96"
              images={review.photos.map((photo: Photo) => photo.photo)}
            />
          </div>
        )}
        {review.title && (
          <p className="mt-2 text-sm font-semibold text-gray-700">{review?.title}</p>
        )}
        <div className="mt-2">
          <p className="text-sm font-normal text-gray-500">{review.description}</p>
        </div>
        <div className="mt-2 flex inline-flex">
          <Button variant="text" className="mr-3" onClick={handleLikeReview}>
            <FavouriteIcon
              variant={isLiked ? 'solid' : 'twotone'}
              size={40}
              className={`${isLiked ? 'text-red-500' : 'text-gray-500'}`}
            />
            <span className="text-sm font-medium">{Math.max(0, review?.totalLikes)} Likes</span>
          </Button>
          <Button variant="text" onClick={() => setIsOpen(true)}>
            <Message02Icon size={20} />
            <span className="text-sm font-medium">Comment</span>
          </Button>
        </div>
        <div className="my-2">
          <Separator />
        </div>
      </div>
    </>
  );
}
