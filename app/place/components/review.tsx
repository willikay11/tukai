'use client';

import Rating from '@/app/components/rating';
import { Button } from '@/components/ui/button';
import { FavouriteIcon, Message02Icon, MoreHorizontalCircle01Icon } from '@hugeicons/react-pro';
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';
import { PlaceReview } from '@/types/place';
import moment from 'moment';
export default function Review({ review }: { review: PlaceReview }) {
  return (
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
        <div className="flex flex-col">
          <Button variant="text">
            <MoreHorizontalCircle01Icon size={20} className="text-gray-500" />
          </Button>
        </div>
      </div>
      <div className="mt-2">
        <p className="text-sm font-normal text-gray-500">{review.description}</p>
      </div>
      <div className="mt-2 flex inline-flex">
        <Button variant="text" className="mr-3">
          <FavouriteIcon size={20} className="text-gray-500" />
          <span className="text-sm font-medium">{review.totalLikes} Likes</span>
        </Button>
        <Button variant="text">
          <Message02Icon size={20} />
          <span className="text-sm font-medium">Comment</span>
        </Button>
      </div>
      <div className="my-2">
        <Separator />
      </div>
    </div>
  );
}
