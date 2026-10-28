'use client';

import { useMemo } from 'react';

import { useQueries } from '@tanstack/react-query';

import { ownReview } from '@/app/shared/components/Experiences';
import { fetchExperienceRatings } from '@/services/experience';
import { ExperienceRating } from '@/types/experienceRating';

import { CalendarItem } from './calendar-agenda';

/**
 * Fanned out per experience rather than one request: the API has no endpoint
 * for "every rating one attendee wrote", only "every rating on one
 * experience". Capped, so a reader with a long history does not open a
 * request per past experience every time the page loads.
 */
const MAX_EXPERIENCES = 12;

export interface ReviewToWrite {
  experienceId: string;
  title: string;
  image?: string;
  when: string;
  organiser?: string;
}

export interface WrittenReview {
  experienceId: string;
  title: string;
  image?: string;
  when: string;
  organiser?: string;
  rating: ExperienceRating;
}

export const useMyReviews = (attended: CalendarItem[], userId?: string | null) => {
  const candidates = useMemo(() => {
    const seen = new Map<string, CalendarItem>();
    attended.forEach((item) => {
      if (!seen.has(item.experienceId)) seen.set(item.experienceId, item);
    });
    return Array.from(seen.values()).slice(0, MAX_EXPERIENCES);
  }, [attended]);

  const results = useQueries({
    queries: candidates.map((item) => ({
      queryKey: ['experience-ratings', item.experienceId],
      queryFn: () => fetchExperienceRatings(item.experienceId),
      enabled: Boolean(userId) && Boolean(item.experienceId),
    })),
  });

  const toReview: ReviewToWrite[] = [];
  const written: WrittenReview[] = [];

  candidates.forEach((item, index) => {
    const payload = results[index]?.data?.data;
    const ratings: ExperienceRating[] = Array.isArray(payload) ? payload : [];
    const mine = ownReview(ratings, userId);

    if (mine) {
      written.push({
        experienceId: item.experienceId,
        title: item.title,
        image: item.image,
        when: item.date,
        organiser: item.organiser,
        rating: mine,
      });
    } else {
      toReview.push({
        experienceId: item.experienceId,
        title: item.title,
        image: item.image,
        when: item.date,
        organiser: item.organiser,
      });
    }
  });

  return {
    isLoading: results.some((result) => result.isLoading),
    toReview,
    written,
  };
};
