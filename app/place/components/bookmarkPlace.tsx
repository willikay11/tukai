'use client';

import { Button } from '@/components/ui/button';
import { useBookmarkPlace, useUnbookmarkPlace } from '@/hooks/places';
import { Bookmark02Icon } from '@hugeicons/react-pro';
import { useState } from 'react';

export default function BookmarkPlace({
  placeId,
  userId,
  bookmarked,
  className = 'text-gray-500',
}: {
  placeId: string;
  userId: string;
  bookmarked: boolean;
  className?: string;
}) {
  const [isBookmarked, setIsBookmarked] = useState(bookmarked);
  const { mutate: bookmarkPlace } = useBookmarkPlace(placeId, userId);
  const { mutate: unbookmarkPlace } = useUnbookmarkPlace(placeId, userId);

  return (
    <Button
      variant="text"
      className="h-fit"
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        e.nativeEvent.stopImmediatePropagation();
        isBookmarked ? unbookmarkPlace() : bookmarkPlace();
        setIsBookmarked(!isBookmarked);
      }}
    >
      <Bookmark02Icon
        size={16}
        variant={isBookmarked ? 'solid' : 'twotone'}
        className={`${isBookmarked ? 'text-red-500' : className}`}
      />
    </Button>
  );
}
