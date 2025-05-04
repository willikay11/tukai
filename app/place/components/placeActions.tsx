'use client';

import { Button } from '@/components/ui/button';
import AddReview from './addReview';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Share from '@/components/ui/share';
import { useBookmarkPlace } from '@/hooks/places';
import Bookmark from '@/app/bookmark';

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
        isOpen={isOpen}
        placeTitle={placeTitle}
        placeId={placeId}
        closeModal={() => setIsOpen(false)}
      />
    </>
  );
}
