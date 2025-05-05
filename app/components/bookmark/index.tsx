'use client';

import { Button } from '@/components/ui/button';
import { Bookmark02Icon } from '@hugeicons/react-pro';
import { useState } from 'react';

export default function Bookmark({
  bookmarked,
  onBookmark,
  onUnbookmark,
  className = 'text-gray-500',
}: {
  bookmarked: boolean;
  onBookmark: () => void;
  onUnbookmark: () => void;
  className?: string;
}) {
  const [isBookmarked, setIsBookmarked] = useState(bookmarked);
  return (
    <Button
      variant="text"
      className="h-fit"
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        e.nativeEvent.stopImmediatePropagation();
        isBookmarked ? onUnbookmark() : onBookmark();
        setIsBookmarked(!isBookmarked);
      }}
    >
      <Bookmark02Icon
        id="bookmark"
        size={16}
        variant={isBookmarked ? 'solid' : 'twotone'}
        className={`${isBookmarked ? 'text-red-500' : className}`}
      />
    </Button>
  );
}
