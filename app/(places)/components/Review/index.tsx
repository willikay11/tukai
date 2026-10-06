'use client';

import { useEffect, useState } from 'react';

import { useSession } from 'next-auth/react';

import { FavouriteIcon, Message02Icon } from '@hugeicons/react-pro';
import moment from 'moment';

import { IconComponent } from '@/app/shared/components/Icons';
import { PhotoImage } from '@/app/shared/components/Images';
import { Rating } from '@/app/shared/components/Rating/Rating';
import { Button } from '@/components/ui/button';
import { TukaiImage } from '@/components/ui/image';
import { ImageCarousel } from '@/components/ui/imageCarousel';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Photo } from '@/types/photo';
import { Review as ReviewType } from '@/types/review';

import { AddReview } from './AddReview';
import { AddReviewComment } from './AddReviewComment';

export const Review = ({
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
  variant = 'default',
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
  /**
   * 'panel' is the place drawer's row: full bleed with a rule above it, a 48px
   * avatar, a 15px body and a strip of square photos. The default is the
   * place page's review card.
   */
  variant?: 'default' | 'panel';
}) => {
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

  const isOwner = review.reviewer.id === session?.user?.id;
  const reviewerName = `${review.reviewer.firstName} ${review.reviewer.lastName}`;

  const dialogs = (
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
        isSubmitting={undefined}
      />
    </>
  );

  const menu = isOwner ? (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="text"
          className={variant === 'panel' ? 'h-11 w-11 justify-center' : undefined}
        >
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
  ) : null;

  if (variant === 'panel') {
    return (
      <>
        {dialogs}
        <article className="-mx-6 flex flex-col gap-2.5 border-t border-line px-6 py-[18px]">
          <div className="flex items-start gap-3.5">
            <div className="relative h-12 w-12 flex-shrink-0">
              <TukaiImage
                src={review.reviewer.picture}
                alt={reviewerName}
                className="h-12 w-12 rounded-full"
                quality={100}
                layout="fill"
                objectFit="cover"
                showNotFoundText={false}
              />
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-2.5">
              <div className="flex items-start gap-2">
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="text-[15.5px] font-semibold text-gray-800">{reviewerName}</span>
                  <span className="flex items-center gap-1.5 text-[13.5px] text-ink-muted">
                    <IconComponent
                      iconName="StarIcon"
                      variant="bulk"
                      size={16}
                      color="currentColor"
                      className="flex-shrink-0 text-star"
                    />
                    <span className="text-gray-800">{review.rating}</span>
                    <span
                      aria-hidden="true"
                      className="h-[5px] w-[5px] flex-shrink-0 rounded-full bg-distance"
                    />
                    <span>{moment(review.dateCreated).format('MMM YYYY')}</span>
                  </span>
                </div>
                {menu && <div className="-mr-2.5 -mt-2.5 flex-shrink-0">{menu}</div>}
              </div>

              {review.title && (
                <p className="text-sm font-semibold text-gray-800">{review.title}</p>
              )}
              <p className="text-[15px] leading-[1.55] text-gray-800">{review.description}</p>

              {review.photos.length > 0 && (
                <div className="-mr-6 flex gap-2.5 overflow-x-auto pr-6 scrollbar-hide">
                  {review.photos.map((photo: Photo, index: number) => (
                    <div
                      key={`${photo.photo}-${index}`}
                      className="relative h-[150px] w-[150px] flex-shrink-0 overflow-hidden rounded-xl bg-surface"
                    >
                      <PhotoImage
                        src={photo.photo}
                        alt={review.title || `Photo from ${reviewerName}`}
                        fill
                        sizes="150px"
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}

              <div className="-mb-1.5 flex items-center gap-3.5">
                <Button
                  variant="text"
                  className="h-11 gap-[7px] text-[14.5px] text-gray-800"
                  onClick={handleLikeReview}
                >
                  <FavouriteIcon
                    variant={isLiked ? 'solid' : 'twotone'}
                    size={20}
                    className={isLiked ? 'text-red-500' : 'text-gray-800'}
                  />
                  <span>{Math.max(0, review?.totalLikes)} Likes</span>
                </Button>
                <Button
                  variant="text"
                  className="h-11 gap-[7px] text-[14.5px] text-gray-800"
                  onClick={() => setIsOpen(true)}
                >
                  <Message02Icon size={20} />
                  <span>{review.totalComments} Comments</span>
                </Button>
              </div>
            </div>
          </div>
        </article>
      </>
    );
  }

  return (
    <>
      {dialogs}

      <div className="flex flex-col">
        <div className="flex w-full items-center justify-between">
          <div className="inline-flex">
            <div className="relative mr-2 flex aspect-square h-10 w-10 flex-col">
              <TukaiImage
                src={review.reviewer.picture}
                alt={review.reviewer.displayName}
                className="h-10 w-10 rounded-full"
                quality={100}
                layout="fill"
                objectFit="cover"
                showNotFoundText={false}
              />
            </div>
            <div className="ml-1">
              <div className="font-bold text-gray-700">
                {review.reviewer.firstName} {review.reviewer.lastName}
              </div>
              <div className="inline-flex items-center">
                <Rating rating={review.rating} showCount={true} showMultiStar={true} />
                <div className="mx-1 h-1 w-1 rounded-full bg-gray-200" />
                <span className="text-sm text-gray-500">
                  {moment(review.dateCreated).format('MMM YYYY')}
                </span>
              </div>
            </div>
          </div>
          {menu}
        </div>
        {review.photos.length > 0 && (
          <div className="mt-2 w-full">
            <ImageCarousel images={review.photos.map((photo: Photo) => photo.photo)} />
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
            <span className="text-sm font-medium"> {review.totalComments} Comments</span>
          </Button>
        </div>
        <div className="my-2">
          <Separator />
        </div>
      </div>
    </>
  );
};
