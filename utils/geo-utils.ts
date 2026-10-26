/**
 * Great-circle distance between two coordinates in kilometres, unrounded. For
 * a distance shown to the tenth of a kilometre.
 */
export const greatCircleKm = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const earthRadiusKm = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

/**
 * Great-circle distance between two coordinates in kilometres, rounded to
 * the nearest whole km. Used to show "N Kms" on experience cards - the API
 * does not return a distance field.
 */
export const haversineKm = (lat1: number, lng1: number, lat2: number, lng2: number): number =>
  Math.round(greatCircleKm(lat1, lng1, lat2, lng2));

/** "2.4 km" under 10 km, one decimal; "12 km" from 10 km, a whole number. */
export const formatDistanceKm = (km: number): string =>
  km < 10 ? `${km.toFixed(1)} km` : `${Math.round(km)} km`;

/** As `formatDistanceKm`, with "away" appended. Under 100 m reads as less than 0.1. */
export const formatNearbyDistance = (km: number): string =>
  km < 0.1 ? 'Less than 0.1 km away' : `${formatDistanceKm(km)} away`;
