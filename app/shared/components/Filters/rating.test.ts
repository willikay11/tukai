import { Place } from '@/types/place';

import { RATING_BANDS, matchesRating } from './rating';

const place = (overrides: Partial<Place> = {}): Place =>
  ({
    id: 'p1',
    title: 'Karura Forest',
    totalReviews: 42,
    averageRating: 4.6,
    ...overrides,
  }) as unknown as Place;

describe('RATING_BANDS', () => {
  it('offers the two star bands, in order and the canvas words', () => {
    expect(RATING_BANDS.map((band) => band.label)).toEqual(['4.0 and up', '4.5 and up']);
  });
});

describe('matchesRating', () => {
  it('keeps everything when no band is picked', () => {
    expect(matchesRating(place({ totalReviews: 0, averageRating: 0 }), undefined)).toBe(true);
  });

  it('keeps a place at or above the pick', () => {
    expect(matchesRating(place({ averageRating: 4 }), 4)).toBe(true);
    expect(matchesRating(place({ averageRating: 4.8 }), 4.5)).toBe(true);
  });

  it('drops a place below the pick', () => {
    expect(matchesRating(place({ averageRating: 3.9 }), 4)).toBe(false);
  });

  // null until a place has been reviewed - a rating with nothing behind it
  // does not count as meeting any minimum
  it('drops a place with no reviews yet', () => {
    expect(matchesRating(place({ totalReviews: null, averageRating: 5 }), 4)).toBe(false);
  });
});
