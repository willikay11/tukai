import { formatDistanceKm, formatNearbyDistance, greatCircleKm, haversineKm } from './geo-utils';

describe('greatCircleKm', () => {
  it('is zero for the same point', () => {
    expect(greatCircleKm(-1.2921, 36.8219, -1.2921, 36.8219)).toBeCloseTo(0, 5);
  });

  // Nairobi CBD to JKIA, a known ~15-16 km hop
  it('measures a real distance in the right ballpark', () => {
    const km = greatCircleKm(-1.2921, 36.8219, -1.3192, 36.9278);

    expect(km).toBeGreaterThan(10);
    expect(km).toBeLessThan(20);
  });
});

describe('haversineKm', () => {
  it('rounds to the nearest whole km', () => {
    expect(haversineKm(-1.2921, 36.8219, -1.3192, 36.9278)).toBe(
      Math.round(greatCircleKm(-1.2921, 36.8219, -1.3192, 36.9278)),
    );
  });
});

describe('formatDistanceKm', () => {
  // One decimal under 10 km
  it('shows one decimal under 10 km', () => {
    expect(formatDistanceKm(2.4)).toBe('2.4 km');
    expect(formatDistanceKm(9.96)).toBe('10.0 km');
  });

  // A whole number from 10 km
  it('shows a whole number from 10 km', () => {
    expect(formatDistanceKm(10)).toBe('10 km');
    expect(formatDistanceKm(12.4)).toBe('12 km');
    expect(formatDistanceKm(111.2)).toBe('111 km');
  });
});

describe('formatNearbyDistance', () => {
  it('reads "away" after the same tiered distance', () => {
    expect(formatNearbyDistance(2.4)).toBe('2.4 km away');
    expect(formatNearbyDistance(12.4)).toBe('12 km away');
  });

  it('reads as less than 0.1 km under 100 m', () => {
    expect(formatNearbyDistance(0.05)).toBe('Less than 0.1 km away');
  });
});
