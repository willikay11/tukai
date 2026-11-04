import { Experience } from '@/types/experience';
import { Photo, coverPhotoUrl, photoUrl } from '@/types/photo';
import { moneyAmount } from '@/utils/money';

/** The cover crossfades through at most this many photos: the first stop and the next three. */
export const COVER_PHOTO_LIMIT = 4;

/** Between one step of the crossfade and the next. */
export const CROSSFADE_STEP_MS = 2200;

/** From a card first coming into view to its first step, before the stagger. */
export const CROSSFADE_FIRST_VIEW_MS = 1200;

/** From the pointer arriving on the cover to its first step. */
export const CROSSFADE_HOVER_MS = 250;

/** How far each card in a run of five waits behind the one before it. */
const CROSSFADE_STAGGER_MS = 700;

/**
 * The cover's photos, cover first, without repeats.
 *
 * ⚠️ The design reads these from the itinerary's stops - each stop's place
 * photo. The list serializer carries no stops (they live behind
 * `/experiences/{id}/itinerary-days/`, one request per card), so the
 * itinerary's own photos stand in for them, as the stop fan always has.
 */
export const itineraryCoverPhotos = (photos: Photo[] | null | undefined): string[] => {
  const cover = coverPhotoUrl(photos, 'md');
  const rest = (photos ?? []).map((photo) => photoUrl(photo, 'md'));

  return [cover, ...rest]
    .filter((url, index, all): url is string => Boolean(url) && all.indexOf(url) === index)
    .slice(0, COVER_PHOTO_LIMIT);
};

/**
 * The first-view delay's stagger: neighbouring cards wait 0, 0.7, 1.4, 2.1 and
 * 2.8s, then the pattern starts again, so a row never plays in lockstep.
 */
export const crossfadeOffset = (position: number): number =>
  (Math.max(0, position) % 5) * CROSSFADE_STAGGER_MS;

/** "KES 6,500", for the rail's "from" line. Null when the API has no price. */
export const startingPrice = (itinerary: Experience): string | null => {
  const amount = moneyAmount(itinerary.priceStartsFrom);
  if (amount === null) return null;

  const currency = itinerary.priceStartsFrom?.currency ?? '';
  return `${currency} ${amount.toLocaleString('en-US')}`.trim();
};
