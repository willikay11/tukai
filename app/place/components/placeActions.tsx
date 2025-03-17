'use client';

import { Button } from '@/components/ui/button';
import { Share08Icon } from '@hugeicons/react-pro';
import BookmarkPlace from './bookmarkPlace';
import AddReview from './addReview';
import { useState } from 'react';
export default function PlaceActions({
  placeId,
  userId,
  bookmarked,
  placeTitle,
}: {
  placeId: string;
  userId: string;
  bookmarked: boolean;
  placeTitle: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="inline-flex h-full items-center justify-center">
        <BookmarkPlace placeId={placeId} userId={userId} bookmarked={bookmarked} />
        <div className="mx-2 h-[8px] w-[1px] rounded bg-gray-300" />
        <Share08Icon size={16} variant="twotone" className="text-primary" />
        <div className="mr-2" />
        <Button onClick={() => setIsOpen(true)}>Add Review</Button>
      </div>
      <AddReview
        isOpen={isOpen}
        placeTitle={placeTitle}
        placeId={placeId}
        closeModal={() => setIsOpen(false)}
      />
    </>
  );
}
