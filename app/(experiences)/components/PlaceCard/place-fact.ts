import { Place } from '@/types/place';
import { PlaceCategory } from '@/types/placeCategory';

/**
 * The one line of substance under a place's name.
 *
 * The brief picks the most useful true thing it knows, in order: an activity
 * happening there, then hours or an attribute, then the category.
 *
 * ⚠️ The list serializer carries none of the first two. It returns no
 * experiences and no opening hours - hours live behind
 * `/places/{id}/availability-rules/`, one request per place, which a rail of
 * ten cards cannot spend. Properties are on the detail endpoint only. So on a
 * card the category is the fact that shows. The score is left off: it is not
 * in the brief's order, and "No reviews yet" reads as missing data.
 */
export type PlaceFact = {
  text: string;
  icon: string;
  /** Green where it is something happening, ink where it is a fact about the place. */
  tone: 'event' | 'plain' | 'muted';
};

/** The kind of place, from the interests group - the city ones are the area. */
export const placeKind = (place: Place): string | undefined =>
  place.categories?.find((category: PlaceCategory) => category.group === 'interests')?.name;

/**
 * Nothing when the place has no category either - the card then leaves the
 * line out rather than saying something untrue about the place.
 */
export const placeFact = (place: Place): PlaceFact | undefined => {
  const kind = placeKind(place);
  if (kind) return { text: kind, icon: 'Tag01Icon', tone: 'muted' };

  return undefined;
};

/** Where the place is: its area, which sits under the name. */
export const placeLocality = (place: Place): string | undefined =>
  place.location?.city || place.location?.name || undefined;
