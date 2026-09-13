'use client';

import { useSession } from 'next-auth/react';

import { Bookmark } from '@/app/shared/components/Bookmark';
import { Experience } from '@/types/experience';

export const BookmarkExperience = ({ experience }: { experience: Experience }) => {
  const { data: session } = useSession();

  return (
    <Bookmark
      userId={session?.user?.id}
      bookmarked={experience.isBookmarked}
      experienceId={experience.id}
      itemName={experience.title}
    />
  );
};
