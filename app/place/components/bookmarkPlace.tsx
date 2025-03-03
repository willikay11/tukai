'use client';

import { Button } from '@/components/ui/button';
import { useBookmarkPlace, useUnbookmarkPlace } from '@/hooks/places';
import { Bookmark02Icon } from '@hugeicons/react-pro';
import { useState } from 'react';

export default function BookmarkPlace({
  placeId,
  userId,
  bookmarked,
}: {
  placeId: string;
  userId: string;
  bookmarked: boolean;
}) {
  const [isBookmarked, setIsBookmarked] = useState(bookmarked);
  const { mutate: bookmarkPlace } = useBookmarkPlace(placeId, userId);
  const { mutate: unbookmarkPlace } = useUnbookmarkPlace(placeId, userId);

  return (
    <Button
      variant="text"
      className="mr-1"
      onClick={() => {
        setIsBookmarked(!isBookmarked);
        isBookmarked ? unbookmarkPlace() : bookmarkPlace();
      }}
    >
      <Bookmark02Icon
        size={16}
        variant={isBookmarked ? 'solid' : 'twotone'}
        className={`${isBookmarked ? 'text-red-500' : 'text-gray-500'}`}
      />
    </Button>
  );
}
