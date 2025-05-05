'use client';

import Bookmark from "@/app/components/bookmark";
import { Experience } from "@/types/experience";

// import { useBookmarkExperience } from '@/hooks/experiences';

export default function BookmarkExperience({ experience }: { experience: Experience }) {
//   const { mutate: bookmarkExperience } = useBookmarkExperience(experienceId);

  return (
    <Bookmark
      bookmarked={false}
      onBookmark={() => {}}
      onUnbookmark={() => {}}
    />
  );
}