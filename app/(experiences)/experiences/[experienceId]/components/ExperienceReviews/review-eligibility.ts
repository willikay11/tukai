import { ExperienceRating } from '@/types/experienceRating';

/**
 * Whether to offer the review form at all.
 *
 * The API is the authority — it takes a review from an attendee of an
 * experience that has ended who has not already rated it, and says which of
 * those failed. This only decides whether to put the form in front of someone,
 * and it answers the two questions the page can already see: has it happened,
 * and have they said their piece.
 */
export const hasEnded = (endDate?: string | null, now: number = Date.now()): boolean => {
  if (!endDate) return false;

  const end = new Date(endDate).getTime();

  return !Number.isNaN(end) && end < now;
};

export const ownReview = (
  ratings: ExperienceRating[],
  userId?: string | null,
): ExperienceRating | undefined =>
  userId ? ratings.find((one) => one.attendee?.id === userId) : undefined;

export const canOfferReviewForm = ({
  ratings,
  userId,
  endDate,
  now = Date.now(),
}: {
  ratings: ExperienceRating[];
  userId?: string | null;
  endDate?: string | null;
  now?: number;
}): boolean => Boolean(userId) && hasEnded(endDate, now) && !ownReview(ratings, userId);
