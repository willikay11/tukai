'use client';

import { useState } from 'react';

import { ShoppingBasket01Icon } from '@hugeicons/react-pro';

import { useBookmarkExperience } from '@/app/shared/hooks/useExperiences';
import { useAuthDialog } from '@/context/AuthDialogContext';
import { useSession } from 'next-auth/react';

interface BucketListButtonProps {
  experienceId: string;
  isBookmarked: boolean;
}

export const BucketListButton = ({
  experienceId,
  isBookmarked,
}: BucketListButtonProps) => {
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
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="
        flex items-center gap-2
        px-5 py-2.5 rounded-full
        bg-white border border-gray-200
        text-gray-800 text-sm font-medium
        hover:border-gray-300 hover:bg-gray-50
        transition-colors
        disabled:opacity-50
      "
    >
      <span>{bookmarked ? 'Saved to Bucket List' : 'Add to Bucket List'}</span>
      <ShoppingBasket01Icon size={16} className="text-gray-800" />
    </button>
  );
};
