'use client';

import { useState } from 'react';

import {
  Bookmark02Icon,
  ShoppingBasketAdd02Icon,
  ShoppingBasketDone02Icon,
} from '@hugeicons/react-pro';

import { toast } from '@/app/shared/hooks/useToast';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { SignInForm } from '@/components/ui/form/sign-in';
import { useAuthDialog } from '@/context/AuthDialogContext';
import { cn } from '@/lib/utils';

export const Bookmark = ({
  bookmarked,
  onBookmark,
  onUnbookmark,
  userId,
  className = 'text-gray-500',
  icon = 'bookmark',
}: {
  bookmarked: boolean;
  onBookmark: () => void;
  onUnbookmark: () => void;
  userId?: string | null;
  className?: string;
  // 'basket' is the add-to-bucket-list treatment used over an experience photo:
  // it owns its own circular container so the container can react to the added
  // state, which a wrapper outside this component cannot do
  icon?: 'bookmark' | 'basket';
}) => {
  const [isBookmarked, setIsBookmarked] = useState(bookmarked);
  const { setOpenSignIn } = useAuthDialog();
  const isBasket = icon === 'basket';
  return (
    <>
      <Button
        variant="text"
        className={cn(
          'h-fit',
          isBasket && 'flex h-9 w-9 items-center justify-center rounded-full',
          isBasket &&
            (isBookmarked ? 'bg-white hover:bg-white' : 'bg-black/40 backdrop-blur-sm'),
        )}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          e.nativeEvent.stopImmediatePropagation();
          if (userId) {
            if (isBookmarked) {
              onUnbookmark();
            } else {
              onBookmark();
            }
            setIsBookmarked(!isBookmarked);
          } else {
            setOpenSignIn(true);
          }
        }}
      >
        {isBasket ? (
          isBookmarked ? (
            <ShoppingBasketDone02Icon
              id="bookmark"
              size={18}
              variant="solid"
              className="text-lime"
            />
          ) : (
            <ShoppingBasketAdd02Icon
              id="bookmark"
              size={18}
              variant="twotone"
              className={className}
            />
          )
        ) : (
          <Bookmark02Icon
            id="bookmark"
            size={18}
            variant={isBookmarked ? 'solid' : 'twotone'}
            className={`${isBookmarked ? 'text-red-500' : className}`}
          />
        )}
      </Button>
    </>
  );
};
