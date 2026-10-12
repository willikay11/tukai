import { Experience } from '@/types/experience';
import { Place } from '@/types/place';
import { DistanceBand } from '@/types/search';

export const DISTANCE_BANDS: Array<{ value: DistanceBand; label: string; km: number }> = [
  { value: '1km', label: 'Within 1 km', km: 1 },
  { value: '5km', label: 'Within 5 km', km: 5 },
  { value: '10km', label: 'Within 10 km', km: 10 },
  { value: '25km', label: 'Within 25 km', km: 25 },
  { value: '100km', label: 'Within 100 km', km: 100 },
];

/** Where "central Nairobi" is measured from, until the reader grants their own. */
export const NAIROBI_CENTER = { lat: -1.2921, lng: 36.8219 };

const EARTH_RADIUS_KM = 6371;
const toRadians = (degrees: number): number => (degrees * Math.PI) / 180;

/** Great-circle distance between two points, in kilometres. */
export const distanceKm = (
  from: { lat: number; lng: number },
  to: { lat: number; lng: number },
): number => {
  const dLat = toRadians(to.lat - from.lat);
  const dLng = toRadians(to.lng - from.lng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(from.lat)) * Math.cos(toRadians(to.lat)) * Math.sin(dLng / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

/** No band picked means every distance. A row with no coordinates never matches a band. */
export const matchesDistance = (
  row: Experience | Place,
  band: DistanceBand | undefined,
  origin: { lat: number; lng: number },
): boolean => {
  if (!band) return true;

  const lat = row.location?.pointLat;
  const lng = row.location?.pointLong;
  if (lat === undefined || lng === undefined) return false;

  const km = DISTANCE_BANDS.find((one) => one.value === band)?.km ?? Infinity;
  return distanceKm(origin, { lat, lng }) <= km;
};

/** No interests picked means everything matches. */
export const matchesInterests = (row: Experience | Place, interests: string[]): boolean =>
  interests.length === 0 ||
  (row.categories ?? []).some((category) => interests.includes(category.id));
