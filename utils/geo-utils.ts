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
