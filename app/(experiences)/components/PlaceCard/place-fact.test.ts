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
 * ⚠️ The canvas leads this line with an experience happening at the place,
 * then a weekly one, then an offer, with opening hours as the fallback. The
 * places list carries none of those, so the order is what it does carry.
 */
describe('placeFact', () => {
  it('leads with the score and its count', () => {
    expect(placeFact(place({ averageRating: 4.6, totalReviews: 128 }))).toMatchObject({
      text: '4.6 · 128 reviews',
      tone: 'plain',
    });
  });

  it('counts one review in the singular', () => {
    expect(placeFact(place({ averageRating: 5, totalReviews: 1 })).text).toBe('5 · 1 review');
  });

  it('groups a large count', () => {
    expect(placeFact(place({ averageRating: 4.2, totalReviews: 1234 })).text).toBe(
      '4.2 · 1,234 reviews',
    );
  });

  // A score with nothing behind it is not a fact worth leading with
  it('ignores a score with no reviews behind it', () => {
    expect(placeFact(place({ averageRating: 4.6, totalReviews: 0 })).text).toBe('Restaurants');
  });

  it('falls back to the kind of place', () => {
    expect(placeFact(place())).toMatchObject({ text: 'Restaurants', tone: 'muted' });
  });

  // Saying so beats an empty line, which reads as missing data
  it('says so when there is nothing else to say', () => {
    expect(placeFact(place({ categories: [] as never })).text).toBe('No reviews yet');
  });
});
