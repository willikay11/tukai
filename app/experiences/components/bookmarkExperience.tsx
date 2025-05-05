'use client';

import Bookmark from "@/app/components/bookmark";
import { useBookmarkExperience } from "@/hooks/experiences";
import { Experience } from "@/types/experience";

export default function BookmarkExperience({ experience }: { experience: Experience }) {
  const { mutate: bookmarkExperience } = useBookmarkExperience();

  return (
    <Bookmark
      bookmarked={experience.isBookmarked}
      onBookmark={() => bookmarkExperience(experience.id)}
      onUnbookmark={() => bookmarkExperience(experience.id)}
    />
  );
}