import { Experience } from '@/types/experience';
import { Place } from '@/types/place';
import { ResultType, SortOption } from '@/types/search';
import { moneyAmount } from '@/utils/money';

import { distanceKm } from './where';

export const SORT_OPTIONS: Array<{ value: SortOption; label: string }> = [
  { value: 'rec', label: 'Recommended' },
  { value: 'soon', label: 'Soonest first' },
  { value: 'near', label: 'Nearest first' },
  { value: 'price', label: 'Lowest price' },
  { value: 'rating', label: 'Top rated' },
];

/**
 * Which options the menu offers, by what "Looking for" is set to - price has
 * nothing to sort a place by, and rating has nothing to sort an upcoming
 * experience by, so neither tab gets the other's option.
 */
export const sortOfferedOn = (type: ResultType): SortOption[] => {
  if (type === 'experiences') return ['rec', 'soon', 'near', 'price'];
  if (type === 'places') return ['rec', 'soon', 'near', 'rating'];
  return SORT_OPTIONS.map((option) => option.value);
};

/**
 * The sort to actually use. A choice the current tab doesn't offer stays in
 * the URL untouched - so it comes back on a tab that does - but the results
 * and the button fall back to Recommended meanwhile.
 */
export const effectiveSort = (sort: SortOption, type: ResultType): SortOption =>
  sortOfferedOn(type).includes(sort) ? sort : 'rec';

type Origin = { lat: number; lng: number };

/** Anything without a known location sorts last, never first. */
const distanceOf = (row: Experience | Place, origin: Origin): number => {
  const lat = row.location?.pointLat;
  const lng = row.location?.pointLong;
  if (lat === undefined || lng === undefined) return Infinity;
  return distanceKm(origin, { lat, lng });
};

const byDate = (a: Experience, b: Experience): number =>
  new Date(a.startDate).getTime() - new Date(b.startDate).getTime();

const byDistance =
  (origin: Origin) =>
  (a: Experience | Place, b: Experience | Place): number =>
    distanceOf(a, origin) - distanceOf(b, origin);

/** `Number(undefined)` is `NaN`, not 0 - this is the safe form for a `?: boolean`. */
const featuredFirst = (a: { featured?: boolean }, b: { featured?: boolean }): number =>
  (b.featured ? 1 : 0) - (a.featured ? 1 : 0);

const priceOf = (experience: Experience): number => moneyAmount(experience.priceStartsFrom) ?? 0;

/**
 * Experiences, in the order `sort` asks for.
 *
 * Featured-first (Recommended) is best-effort: `featured` is a flag on
 * whatever page the API happened to return, not a stable order the endpoint
 * can be asked for - see `experiences/components/featured-experiences.ts`.
 * Ties throughout keep the order they arrived in, same as everywhere else:
 * `Array.prototype.sort` is stable, and these comparators return 0 for one.
 */
export const sortExperiences = (
  experiences: Experience[],
  sort: SortOption,
  origin: Origin,
): Experience[] => {
  const sorted = [...experiences];

  if (sort === 'rec') return sorted.sort((a, b) => featuredFirst(a, b) || byDate(a, b));
  if (sort === 'near') return sorted.sort((a, b) => byDistance(origin)(a, b) || byDate(a, b));
  if (sort === 'price') return sorted.sort((a, b) => priceOf(a) - priceOf(b) || byDate(a, b));
  // 'soon', and 'rating' - rating has nothing of its own for an experience,
  // so it stays in date order, same as the canvas keeps Discover's
  // Experiences section under Top rated
  return sorted.sort(byDate);
};

/**
 * Places, in the order `sort` asks for.
 *
 * ⚠️ "Soonest first" is meant to put open-now places first, then nearest -
 * there is no "is this place open right now" field anywhere (opening hours
 * exist only per-place, behind a reservation profile, one request each,
 * see `PlaceDrawer/reservation-summary.ts`), so this is nearest-first only
 * until that data exists. "Lowest price" has nothing to sort a place by, so
 * it falls back to nearest too, same as the canvas's own Discover-tab
 * fallback. Featured-first (Recommended) is the closest thing to "boosted"
 * or "promoted" this data has - there is no search-boost or promotion
 * concept anywhere in the app today.
 */
export const sortPlaces = (places: Place[], sort: SortOption, origin: Origin): Place[] => {
  const sorted = [...places];

  const byRatingThenReviews = (a: Place, b: Place): number =>
    b.averageRating - a.averageRating || (b.totalReviews ?? 0) - (a.totalReviews ?? 0);

  if (sort === 'rec') {
    return sorted.sort(
      (a, b) => featuredFirst(a, b) || (b.totalReviews ?? 0) - (a.totalReviews ?? 0),
    );
  }
  if (sort === 'rating') return sorted.sort(byRatingThenReviews);
  // 'soon' and 'price' - both fall back to nearest for a place
  return sorted.sort(byDistance(origin));
};
