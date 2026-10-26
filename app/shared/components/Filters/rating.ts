import { Place } from '@/types/place';
import { RatingBand } from '@/types/search';

export const RATING_BANDS: Array<{ value: RatingBand; label: string }> = [
  { value: 4, label: '4.0 and up' },
  { value: 4.5, label: '4.5 and up' },
];

/** Rating narrows places only - it has reviews, and is at or above the pick. */
export const matchesRating = (place: Place, band: RatingBand | undefined): boolean => {
  if (!band) return true;

  return Boolean(place.totalReviews) && place.averageRating >= band;
};
