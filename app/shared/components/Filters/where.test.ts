import { Experience } from '@/types/experience';

import { DISTANCE_BANDS, NAIROBI_CENTER, distanceKm, matchesDistance, matchesInterests } from './where';

const experience = (overrides: Partial<Experience> = {}): Experience =>
  ({
    id: 'e1',
    title: 'Sunrise hike',
    categories: [{ id: 'c1', name: 'Hiking', icon: '' }],
    location: { pointLat: NAIROBI_CENTER.lat, pointLong: NAIROBI_CENTER.lng },
    ...overrides,
  }) as unknown as Experience;

describe('DISTANCE_BANDS', () => {
  it('offers the canvas five, in its order and its words', () => {
    expect(DISTANCE_BANDS.map((band) => band.label)).toEqual([
      'Within 1 km',
      'Within 5 km',
      'Within 10 km',
      'Within 25 km',
      'Within 100 km',
    ]);
  });
});

describe('distanceKm', () => {
  it('is zero for the same point', () => {
    expect(distanceKm(NAIROBI_CENTER, NAIROBI_CENTER)).toBeCloseTo(0, 5);
  });

  // Nairobi to Mombasa is roughly 440km as the crow flies
  it('reads a known pair close to its real distance', () => {
    const mombasa = { lat: -4.0435, lng: 39.6682 };
    expect(distanceKm(NAIROBI_CENTER, mombasa)).toBeGreaterThan(430);
    expect(distanceKm(NAIROBI_CENTER, mombasa)).toBeLessThan(450);
  });
});

describe('matchesDistance', () => {
  it('keeps everything when no band is picked', () => {
    expect(matchesDistance(experience(), undefined, NAIROBI_CENTER)).toBe(true);
  });

  it('keeps a row inside the band and drops one outside it', () => {
    const near = experience({ location: { pointLat: -1.293, pointLong: 36.823 } as never });
    const far = experience({ location: { pointLat: -4.0435, pointLong: 39.6682 } as never });

    expect(matchesDistance(near, '1km', NAIROBI_CENTER)).toBe(true);
    expect(matchesDistance(far, '1km', NAIROBI_CENTER)).toBe(false);
    expect(matchesDistance(far, '100km', NAIROBI_CENTER)).toBe(false);
  });

  it('drops a row with no coordinates to read', () => {
    expect(
      matchesDistance(experience({ location: undefined as never }), '1km', NAIROBI_CENTER),
    ).toBe(false);
  });
});

describe('matchesInterests', () => {
  it('keeps everything when nothing is picked', () => {
    expect(matchesInterests(experience(), [])).toBe(true);
  });

  it('keeps a row carrying one of the picked interests', () => {
    expect(matchesInterests(experience(), ['c1', 'c2'])).toBe(true);
    expect(matchesInterests(experience(), ['c2'])).toBe(false);
  });

  it('drops a row with no categories to read', () => {
    expect(matchesInterests(experience({ categories: undefined }), ['c1'])).toBe(false);
  });
});
