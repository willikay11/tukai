'use client';

import { useState } from 'react';

import { useSession } from 'next-auth/react';

import { IconComponent } from '@/app/shared/components';
import { BucketListPicker } from '@/app/shared/components/BucketList';
import { Button } from '@/components/ui/button';
import { useAuthDialog } from '@/context/AuthDialogContext';

interface BucketListButtonProps {
  experienceId: string;
  isBookmarked: boolean;
  /** Named in the confirmation once it is saved */
  experienceTitle?: string;
  // Renders normally but does nothing — used by the create-flow preview, where
  // the experience id may be synthetic and saving makes no sense
  inert?: boolean;
}

/**
 * Saves an experience onto one of the reader's bucket lists.
 *
 * Which list is a choice, so this opens the picker rather than toggling: it
 * used to bookmark on the spot, which put nothing on any list.
 */
export const BucketListButton = ({
  experienceId,
  isBookmarked,
  experienceTitle,
  inert = false,
}: BucketListButtonProps) => {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const { data: session } = useSession();
  const { openSignInWithCallback } = useAuthDialog();

  const handleClick = () => {
    if (inert) return;

    // Signing in carries straight on to the picker, so the one press the reader
    // made is the one that gets them there
    if (!session?.user?.id) {
      openSignInWithCallback(() => setIsPickerOpen(true));
      return;
    }

    setIsPickerOpen(true);
  };

  return (
    <>
      <Button
        type="button"
        onClick={handleClick}
        variant={isBookmarked ? 'default' : 'outline'}
        className="rounded-full"
      >
        <span>{isBookmarked ? 'Saved to Bucket List' : 'Add to Bucket List'}</span>
        <IconComponent iconName="ShoppingBasket01Icon" size={16} className="ml-2" />
      </Button>

      <BucketListPicker
        isOpen={isPickerOpen}
        setIsOpen={setIsPickerOpen}
        experienceId={experienceId}
        itemName={experienceTitle}
      />
    </>
  );
};
