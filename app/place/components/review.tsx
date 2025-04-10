'use client';

import Rating from '@/app/components/rating';
import { Button } from '@/components/ui/button';
import { FavouriteIcon, Message02Icon } from '@hugeicons/react-pro';
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';
import { PlaceReview } from '@/types/place';
import moment from 'moment';
import ImageCarousel from '@/components/ui/imageCarousel';
import { Photo } from '@/types/photo';
import IconComponent from '@/app/components/iconComponent';
import AddReviewComment from './addReviewComment';
import { useState } from 'react';
import { useDeletePlaceReview, useLikePlaceReview } from '@/hooks/places';
import { useSession } from 'next-auth/react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export default function Review({ placeId, review }: { placeId: string; review: PlaceReview }) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isLiked, setIsLiked] = useState(false);
  const { data: session } = useSession();
  const { mutate: likeReview } = useLikePlaceReview(placeId, review.id);
  const { mutate: deleteReview, isPending: isDeletingReview } = useDeletePlaceReview(placeId, review.id);

  const handleLikeReview = () => {
    setIsLiked(!isLiked);
    likeReview();
  };

  const handleDeleteReview = () => {
    deleteReview();
  };

  return (
    <>
      <AddReviewComment
        placeId={placeId}
        reviewId={review.id}
        isOpen={isOpen}
        closeModal={() => setIsOpen(false)}
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
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="text">
                  <IconComponent iconName="MoreHorizontalCircle01Icon" size={20} />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-fit h-fit flex flex-col gap-2 rounded-[15px] shadow-md border-gray-200">
                <Button variant="text" className="p-0 h-fit justify-start">
                  <IconComponent iconName="Edit02Icon" size={20} color="green" />
                  Edit Review
                </Button>
                <Button variant="text" className="p-0 h-fit justify-start" onClick={handleDeleteReview} disabled={isDeletingReview}>
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
            <span className="text-sm font-medium">
              {Math.max(0, review?.totalLikes + (isLiked ? 1 : -1))} Likes
            </span>
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
