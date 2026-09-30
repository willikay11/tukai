import { LinkedUser } from '@/types/user';

/**
 * What an attendee said about an experience they went to.
 *
 * Experiences carry no rating aggregate of their own — no average, no count, on
 * either serializer — so both are worked out from the ratings themselves. The
 * ratings endpoint answers with a bare array rather than a page.
 */
export type ExperienceRatingPhoto = {
  id: string;
  photo?: string | null;
  photoWebpMdUrl?: string | null;
  photoWebpThumbUrl?: string | null;
  caption?: string | null;
};

export type ExperienceRating = {
  id: string;
  experience?: string;
  attendee?: LinkedUser;
  /** One to five. */
  rating: number;
  review?: string | null;
  photos?: ExperienceRatingPhoto[];
  dateCreated?: string;
};

export const RATING_MAX = 5;

/** The average, to one decimal, or null when nobody has rated it yet. */
export const averageRating = (ratings: ExperienceRating[]): number | null => {
  const scores = ratings.map((one) => Number(one.rating)).filter((score) => score > 0);

  if (scores.length === 0) return null;

  const mean = scores.reduce((total, score) => total + score, 0) / scores.length;

  return Math.round(mean * 10) / 10;
};

/** "4.5 · 12 reviews", and the singular where there is only one. */
export const ratingSummary = (ratings: ExperienceRating[]): string | null => {
  const average = averageRating(ratings);
  if (average === null) return null;

  const count = ratings.filter((one) => Number(one.rating) > 0).length;

  return `${average} · ${count} ${count === 1 ? 'review' : 'reviews'}`;
};

/** How many gave each score, five first, for the bars beside the average. */
export const ratingBreakdown = (ratings: ExperienceRating[]): { score: number; count: number }[] =>
  [5, 4, 3, 2, 1].map((score) => ({
    score,
    count: ratings.filter((one) => Number(one.rating) === score).length,
  }));

/** The best photo we have for a rating photo, at the size asked for. */
export const ratingPhotoUrl = (
  photo: ExperienceRatingPhoto,
  size: 'thumb' | 'md' = 'md',
): string | undefined =>
  (size === 'thumb'
    ? photo.photoWebpThumbUrl || photo.photoWebpMdUrl
    : photo.photoWebpMdUrl || photo.photoWebpThumbUrl) ||
  photo.photo ||
  undefined;
