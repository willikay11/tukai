'use client';

import { useEffect, useState } from 'react';

import Image from 'next/image';

import { FavouriteIcon } from '@hugeicons/react-pro';
import moment from 'moment';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useLikePlaceReviewComment } from '@/hooks/places';
import { Comment } from '@/types/comment';

export default function ViewComment({
  comment,
  placeId,
  reviewId,
}: {
  comment: Comment;
  placeId: string;
  reviewId: string;
}) {
  const { mutate: likeComment } = useLikePlaceReviewComment(placeId, reviewId, comment.id);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    setIsLiked(comment?.isLiked);
  }, [comment]);

  const onLikeComment = () => {
    setIsLiked(!isLiked);
    likeComment();
  };

  return (
    <div className="flex flex-col">
      <div className="flex w-full items-center justify-between">
        <div className="inline-flex">
          <div className="relative mr-2 flex aspect-square h-10 w-10 flex-col">
            <Image
              src={comment?.commenter?.picture}
              alt={comment?.commenter?.displayName}
              className="h-10 w-10 rounded-full"
              quality={100}
              layout="fill"
              objectFit="cover"
            />
          </div>
          <div className="ml-1">
            <div className="font-bold text-gray-700">
              {comment?.commenter?.firstName} {comment?.commenter?.lastName}
            </div>
            <div className="inline-flex items-center">
              <span className="text-sm text-gray-500">
                {moment(comment?.dateCreated).format('MMM YYYY')}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-2">
        <p className="text-sm font-normal text-gray-500">{comment?.content}</p>
      </div>
      <div className="mt-2 flex inline-flex">
        <Button
          variant="text"
          className="mr-3"
          onClick={() => {
            onLikeComment();
          }}
        >
          <FavouriteIcon
            variant={isLiked ? 'solid' : 'twotone'}
            size={40}
            className={`${isLiked ? 'text-red-500' : 'text-gray-500'}`}
          />
          <span className="text-sm font-medium">{Math.max(0, comment?.totalLikes)} Likes</span>
        </Button>
      </div>
      <div className="mb-4 mt-2">
        <Separator />
      </div>
    </div>
  );
}
