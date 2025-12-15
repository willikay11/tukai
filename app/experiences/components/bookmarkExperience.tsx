'use client';

import Bookmark from '@/app/components/bookmark';
import { useBookmarkExperience } from '@/hooks/experiences';
import { Experience } from '@/types/experience';
import { useSession } from 'next-auth/react';

export default function BookmarkExperience({ experience }: { experience: Experience }) {
  const { mutate: bookmarkExperience } = useBookmarkExperience();
  const { data: session } = useSession();

  return (
    <Bookmark
      userId={session?.user?.id}
      bookmarked={experience.isBookmarked}
      onBookmark={() => bookmarkExperience(experience.id)}
      onUnbookmark={() => bookmarkExperience(experience.id)}
    />
  );
}
