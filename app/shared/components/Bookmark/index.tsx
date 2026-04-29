'use client';

import { useState } from 'react';

import { Bookmark02Icon } from '@hugeicons/react-pro';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { SignInForm } from '@/components/ui/form/sign-in';
import { useAuthDialog } from '@/context/AuthDialogContext';
import { toast } from '@/app/shared/hooks/useToast';

export const Bookmark = ({
  bookmarked,
  onBookmark,
  onUnbookmark,
  userId,
  className = 'text-gray-500',
}: {
  bookmarked: boolean;
  onBookmark: () => void;
  onUnbookmark: () => void;
  userId?: string | null;
  className?: string;
}) => {
  const [isBookmarked, setIsBookmarked] = useState(bookmarked);
  const { setOpenSignIn } = useAuthDialog();
  return (
    <>
      <Button
        variant="text"
        className="h-fit"
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          e.nativeEvent.stopImmediatePropagation();
          if (userId) {
            isBookmarked ? onUnbookmark() : onBookmark();
            setIsBookmarked(!isBookmarked);
          } else {
            setOpenSignIn(true);
          }
        }}
      >
        <Bookmark02Icon
          id="bookmark"
          size={18}
          variant={isBookmarked ? 'solid' : 'twotone'}
          className={`${isBookmarked ? 'text-red-500' : className}`}
        />
      </Button>
    </>
  );
};
