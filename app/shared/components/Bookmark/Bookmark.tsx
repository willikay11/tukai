'use client';

import { useEffect, useState } from 'react';

import { ShoppingBasketAdd02Icon, ShoppingBasketDone02Icon } from '@hugeicons/react-pro';

import { BucketListPicker } from '@/app/shared/components/BucketList';
import { POP_ONCE } from '@/app/shared/components/Motion';
import { Button } from '@/components/ui/button';
import { useAuthDialog } from '@/context/AuthDialogContext';
import { cn } from '@/lib/utils';

/**
 * What keeps a white basket legible on a pale photo now that there is no disc
 * behind it. Harmless on a dark icon over a white panel, where it reads as a
 * hairline rather than a shadow.
 */
const ICON_SHADOW = '[filter:drop-shadow(0_1px_3px_rgba(1,51,52,.55))]';

/**
 * Saves an experience or a place onto one of the reader's bucket lists.
 *
 * One treatment everywhere: the basket over a photo, which fills in once the
 * thing is saved. The bookmark-pin variant this used to carry is gone — two
 * icons for one action read as two different features.
 *
 * `className` styles the ICON, not the button — it is where a caller sets the
 * colour the basket needs against whatever it is sitting on.
 *
 * Which list is a choice, so pressing it opens the picker rather than toggling
 * on the spot. A caller with neither id falls back to `onBookmark`, for the
 * surfaces that still bookmark without a list.
 */
export const Bookmark = ({
  bookmarked,
  onBookmark,
  onUnbookmark,
  userId,
  className = 'text-gray-500',
  experienceId,
  placeId,
  itemName,
}: {
  bookmarked: boolean;
  onBookmark?: () => void;
  onUnbookmark?: () => void;
  userId?: string | null;
  className?: string;
  experienceId?: string;
  placeId?: string;
  /** Named in the confirmation once it is saved */
  itemName?: string;
}) => {
  const [isBookmarked, setIsBookmarked] = useState(bookmarked);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  // Only a save the reader just made gets the confirmation beat. Keying it off
  // `isBookmarked` alone would pop every already-saved card on page load.
  const [hasJustSaved, setHasJustSaved] = useState(false);

  // Seeded once at mount, so a card that re-read its experience after a save
  // kept showing the empty basket until it was unmounted and built again
  useEffect(() => setIsBookmarked(bookmarked), [bookmarked]);
  const { openSignInWithCallback } = useAuthDialog();

  const savesToList = Boolean(experienceId || placeId);

  const open = () => setIsPickerOpen(true);

  const handleClick = (event: React.MouseEvent) => {
    // The control sits over a card that is itself a link
    event.stopPropagation();
    event.preventDefault();
    event.nativeEvent.stopImmediatePropagation();

    // Signing in carries on to whatever they pressed for
    if (!userId) {
      openSignInWithCallback(savesToList ? open : () => undefined);
      return;
    }

    if (savesToList) {
      open();
      return;
    }

    if (isBookmarked) onUnbookmark?.();
    else onBookmark?.();
    setIsBookmarked(!isBookmarked);
    setHasJustSaved(!isBookmarked);
  };

  return (
    <>
      <Button
        variant="text"
        // The canvas names the thing being saved. A dozen cards on a page all
        // announcing "Add to bucket list" tells a screen-reader reader nothing
        // about which one they are on.
        aria-label={
          itemName
            ? isBookmarked
              ? `Saved. Choose bucket lists for ${itemName}`
              : `Save ${itemName} to a bucket list`
            : isBookmarked
              ? 'Saved to bucket list'
              : 'Add to bucket list'
        }
        // 44px to hit, nothing to look at: the basket sits straight on the
        // photo, with a drop shadow instead of a disc behind it. The disc it
        // used to wear read as a second control over every card.
        className={cn(
          'flex h-11 w-11 items-center justify-center bg-transparent hover:bg-transparent',
          hasJustSaved && POP_ONCE,
        )}
        // The beat plays once; clearing it here lets the next save replay it
        onAnimationEnd={() => setHasJustSaved(false)}
        onClick={handleClick}
      >
        {isBookmarked ? (
          <ShoppingBasketDone02Icon
            id="bookmark"
            size={21}
            variant="solid"
            className={cn('text-lime', ICON_SHADOW)}
          />
        ) : (
          <ShoppingBasketAdd02Icon
            id="bookmark"
            size={21}
            variant="twotone"
            className={cn(className, ICON_SHADOW)}
          />
        )}
      </Button>

      {savesToList && (
        <BucketListPicker
          isOpen={isPickerOpen}
          setIsOpen={setIsPickerOpen}
          experienceId={experienceId}
          placeId={placeId}
          itemName={itemName}
          onSaved={() => {
            setIsBookmarked(true);
            setHasJustSaved(true);
          }}
        />
      )}
    </>
  );
};
