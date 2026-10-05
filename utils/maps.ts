/**
 * Where a spot opens in Google Maps.
 *
 * Google's cross-platform `maps/search/?api=1` URL hands off to the installed
 * Maps app on Android and iOS and falls back to the web everywhere else, so no
 * platform sniffing is needed - and unlike a `comgooglemaps://` scheme it does
 * not dead-end when the app is not installed.
 *
 * Returns null when there is nothing to search for, so a caller can leave the
 * control out rather than linking to an empty map.
 */
export const mapsHref = ({
  lat,
  lng,
  // Used when the place carries no coordinates - a name and city still find it
  query,
}: {
  lat?: number;
  lng?: number;
  query?: string;
}): string | null => {
  const target = lat !== undefined && lng !== undefined ? `${lat},${lng}` : query?.trim();
  if (!target) return null;

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(target)}`;
};
