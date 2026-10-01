import { Place } from '@/types/place';
import { PlaceCategory } from '@/types/placeCategory';

/**
 * The one line of substance under a place's name.
 *
 * The canvas picks the most useful true thing it knows, in order: an
 * experience happening there, then a standing weekly one, then an offer, and
 * opening hours as the fallback.
 *
 * ⚠️ We can answer none of those from a place. `/places/` returns no
 * experiences, no offers and no opening hours on the list serializer — hours
 * live behind `/places/{id}/availability-rules/`, one request per place, which
 * a rail of ten cards cannot spend. So the order here is what a place does
 * carry: what people made of it, then what kind of place it is.
 */
export type PlaceFact = {
  text: string;
  icon: string;
  /** Green where it is something happening, ink where it is a fact about the place. */
  tone: 'event' | 'plain' | 'muted';
};

/** The kind of place, from the interests group — the city ones are the area. */
export const placeKind = (place: Place): string | undefined =>
  place.categories?.find((category: PlaceCategory) => category.group === 'interests')?.name;

export const placeFact = (place: Place): PlaceFact => {
  const reviews = place.totalReviews ?? 0;

  // The canvas's own `reviewFact`, which it uses wherever a place has been rated
  if (place.averageRating > 0 && reviews > 0) {
    return {
      text: `${place.averageRating} · ${reviews.toLocaleString('en-US')} ${
        reviews === 1 ? 'review' : 'reviews'
      }`,
      icon: 'StarIcon',
      tone: 'plain',
    };
  }

  const kind = placeKind(place);
  if (kind) return { text: kind, icon: 'Tag01Icon', tone: 'muted' };

  // Saying so beats an empty line, which reads as missing data rather than as
  // a place nobody has been to yet
  return { text: 'No reviews yet', icon: 'StarIcon', tone: 'muted' };
};

/** Where the place is: its area, which sits under the name. */
export const placeLocality = (place: Place): string | undefined =>
  place.location?.city || place.location?.name || undefined;
