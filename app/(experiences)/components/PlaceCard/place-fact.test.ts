import { Place } from '@/types/place';

import { placeFact, placeKind, placeLocality } from './place-fact';

const place = (overrides: Partial<Place> = {}): Place =>
  ({
    id: 'p1',
    title: 'Talisman',
    averageRating: 0,
    totalReviews: 0,
    location: { city: 'Karen' },
    categories: [
      { id: 'c1', name: 'Karen', group: 'cities' },
      { id: 'c2', name: 'Restaurants', group: 'interests' },
    ],
    ...overrides,
  }) as unknown as Place;

describe('placeKind', () => {
  // Regression: categories[0] is often a city, which is not the kind of place
  it('is the interest category, not the city one', () => {
    expect(placeKind(place())).toBe('Restaurants');
  });

  it('is nothing where no interest category came back', () => {
    expect(placeKind(place({ categories: [] as never }))).toBeUndefined();
  });
});

describe('placeLocality', () => {
  it('is the city', () => {
    expect(placeLocality(place())).toBe('Karen');
  });

  it('falls back to the location name', () => {
    expect(placeLocality(place({ location: { name: 'Karen Rd' } as never }))).toBe('Karen Rd');
  });

  it('is nothing without a location', () => {
    expect(placeLocality(place({ location: undefined as never }))).toBeUndefined();
  });
});

/**
 * ⚠️ The brief leads this line with an activity happening at the place, then
 * hours or an attribute, then the category. The list carries only the last.
 */
describe('placeFact', () => {
  it('is the kind of place', () => {
    expect(placeFact(place())).toMatchObject({ text: 'Restaurants', tone: 'muted' });
  });

  // A score is not in the brief's order, and it is not the one useful fact
  it('ignores the score, even with reviews behind it', () => {
    expect(placeFact(place({ averageRating: 4.6, totalReviews: 128 }))?.text).toBe('Restaurants');
  });

  // Regression: a card must never say it has no reviews
  it('is nothing when there is no category, rather than "No reviews yet"', () => {
    expect(placeFact(place({ categories: [] as never }))).toBeUndefined();
  });
});
