'use client';

import { useState } from 'react';

import { useSession } from 'next-auth/react';

import { IconComponent } from '@/app/shared/components';
import { useBookmarkExperience } from '@/app/shared/hooks/useExperiences';
import { Button } from '@/components/ui/button';
import { useAuthDialog } from '@/context/AuthDialogContext';

interface BucketListButtonProps {
  experienceId: string;
  isBookmarked: boolean;
}

export const BucketListButton = ({ experienceId, isBookmarked }: BucketListButtonProps) => {
  const [bookmarked, setBookmarked] = useState(isBookmarked);
  const { mutate: bookmarkExperience, isPending } = useBookmarkExperience();
  const { data: session } = useSession();
  const { setOpenSignIn } = useAuthDialog();

  const handleClick = () => {
    if (!session?.user?.id) {
      setOpenSignIn(true);
      return;
    }

    bookmarkExperience(experienceId);
    setBookmarked(!bookmarked);
  };

  return (
    <Button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      variant={bookmarked ? 'default' : 'outline'}
      className="rounded-full"
    >
      <span>{bookmarked ? 'Saved to Bucket List' : 'Add to Bucket List'}</span>
      <IconComponent iconName="ShoppingBasket01Icon" size={16} className="ml-2" />
    </Button>
  );
};
