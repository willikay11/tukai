import { Experience } from '@/types/experience';
import { Location } from '@/types/location';
import { Place } from '@/types/place';

import { SORT_OPTIONS, effectiveSort, sortExperiences, sortOfferedOn, sortPlaces } from './sort';

const ORIGIN = { lat: -1.2921, lng: 36.8219 };

// Locations, as they sit on a row's own `location.pointLat`/`pointLong` -
// only those two fields matter here, so the rest of `Location` is left out
const AT_ORIGIN = { pointLat: -1.2921, pointLong: 36.8219 } as unknown as Location;
// ~1.1 km from the origin
const NEARBY = { pointLat: -1.3021, pointLong: 36.8219 } as unknown as Location;
// ~111 km from the origin
const FAR = { pointLat: -2.2921, pointLong: 36.8219 } as unknown as Location;

const experience = (overrides: Partial<Experience> = {}): Experience =>
  ({
    id: 'e1',
    title: 'Sunrise hike',
    startDate: '2026-10-05T06:00:00Z',
    endDate: '2026-10-05T08:00:00Z',
    priceStartsFrom: { amount: 1000, currency: 'KES' },
    location: AT_ORIGIN,
    ...overrides,
  }) as unknown as Experience;

const place = (overrides: Partial<Place> = {}): Place =>
  ({
    id: 'p1',
    title: 'Karura Forest',
    totalReviews: 10,
    averageRating: 4,
    location: AT_ORIGIN,
    ...overrides,
  }) as unknown as Place;

describe('SORT_OPTIONS', () => {
  it('offers the five options, in the design’s menu order', () => {
    expect(SORT_OPTIONS.map((option) => option.value)).toEqual([
      'rec',
      'soon',
      'near',
      'price',
      'rating',
    ]);
  });
});

describe('sortOfferedOn', () => {
  it('offers all five on Discover (every type)', () => {
    expect(sortOfferedOn('all')).toEqual(['rec', 'soon', 'near', 'price', 'rating']);
  });

  it('drops rating on Experiences - an upcoming experience has none', () => {
    expect(sortOfferedOn('experiences')).toEqual(['rec', 'soon', 'near', 'price']);
  });

  it('drops price on Places - a place has no price', () => {
    expect(sortOfferedOn('places')).toEqual(['rec', 'soon', 'near', 'rating']);
  });
});

describe('effectiveSort', () => {
  it('keeps a sort the tab offers', () => {
    expect(effectiveSort('near', 'places')).toBe('near');
  });

  // The choice stays in the URL, but the tab that can't use it sees Recommended
  it('falls back to Recommended for a sort the tab does not offer', () => {
    expect(effectiveSort('rating', 'experiences')).toBe('rec');
    expect(effectiveSort('price', 'places')).toBe('rec');
  });
});

describe('sortExperiences', () => {
  const e1 = experience({ id: 'e1', startDate: '2026-10-06T06:00:00Z', location: AT_ORIGIN });
  const e2 = experience({ id: 'e2', startDate: '2026-10-05T06:00:00Z', location: FAR });
  const e3 = experience({
    id: 'e3',
    startDate: '2026-10-07T06:00:00Z',
    location: NEARBY,
    featured: true,
    priceStartsFrom: { amount: 0, currency: 'KES' },
  });

  it('puts featured first under Recommended, then date order', () => {
    const sorted = sortExperiences([e1, e2, e3], 'rec', ORIGIN);

    expect(sorted.map((e) => e.id)).toEqual(['e3', 'e2', 'e1']);
  });

  it('is plain date order under Soonest first', () => {
    const sorted = sortExperiences([e1, e2, e3], 'soon', ORIGIN);

    expect(sorted.map((e) => e.id)).toEqual(['e2', 'e1', 'e3']);
  });

  it('is nearest first under Nearest first, ties in date order', () => {
    const sorted = sortExperiences([e1, e2, e3], 'near', ORIGIN);

    expect(sorted.map((e) => e.id)).toEqual(['e1', 'e3', 'e2']);
  });

  it('is cheapest first under Lowest price - free is 0, so it leads', () => {
    const sorted = sortExperiences([e1, e2, e3], 'price', ORIGIN);

    expect(sorted.map((e) => e.id)).toEqual(['e3', 'e2', 'e1']);
  });

  // Rating has nothing of its own for an experience - it keeps date order,
  // same as the design keeps Discover's Experiences section under Top rated
  it('falls back to date order under Top rated', () => {
    const sorted = sortExperiences([e1, e2, e3], 'rating', ORIGIN);

    expect(sorted.map((e) => e.id)).toEqual(['e2', 'e1', 'e3']);
  });

  it('sends a row with no location to the end under Nearest first', () => {
    const noLocation = experience({ id: 'e4', location: undefined });
    const sorted = sortExperiences([noLocation, e1], 'near', ORIGIN);

    expect(sorted.map((e) => e.id)).toEqual(['e1', 'e4']);
  });

  it('does not mutate the array it was given', () => {
    const original = [e1, e2, e3];
    sortExperiences(original, 'near', ORIGIN);

    expect(original.map((e) => e.id)).toEqual(['e1', 'e2', 'e3']);
  });
});

describe('sortPlaces', () => {
  const p1 = place({ id: 'p1', location: NEARBY, averageRating: 4.8, totalReviews: 5 });
  const p2 = place({ id: 'p2', location: AT_ORIGIN, averageRating: 4.2, totalReviews: 50 });
  const p3 = place({
    id: 'p3',
    location: FAR,
    featured: true,
    averageRating: 3.9,
    totalReviews: 1,
  });

  it('puts featured first under Recommended, then most reviews', () => {
    const sorted = sortPlaces([p1, p2, p3], 'rec', ORIGIN);

    expect(sorted.map((p) => p.id)).toEqual(['p3', 'p2', 'p1']);
  });

  // Nearest-only until "is this place open now" exists - see the file's own
  // doc comment
  it('is nearest first under Soonest first', () => {
    const sorted = sortPlaces([p1, p2, p3], 'soon', ORIGIN);

    expect(sorted.map((p) => p.id)).toEqual(['p2', 'p1', 'p3']);
  });

  it('is nearest first under Nearest first', () => {
    const sorted = sortPlaces([p1, p2, p3], 'near', ORIGIN);

    expect(sorted.map((p) => p.id)).toEqual(['p2', 'p1', 'p3']);
  });

  // A place has no price - falls back to nearest, same as the design's own
  // Discover-tab fallback
  it('falls back to nearest under Lowest price', () => {
    const sorted = sortPlaces([p1, p2, p3], 'price', ORIGIN);

    expect(sorted.map((p) => p.id)).toEqual(['p2', 'p1', 'p3']);
  });

  it('is highest rating first under Top rated, ties by most reviews', () => {
    const sorted = sortPlaces([p1, p2, p3], 'rating', ORIGIN);

    expect(sorted.map((p) => p.id)).toEqual(['p1', 'p2', 'p3']);
  });

  it('sends a row with no location to the end under Nearest first', () => {
    const noLocation = place({ id: 'p4', location: undefined });
    const sorted = sortPlaces([noLocation, p1], 'near', ORIGIN);

    expect(sorted.map((p) => p.id)).toEqual(['p1', 'p4']);
  });
});
