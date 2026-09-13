import { ReactNode } from 'react';

import { IconComponent } from '@/app/shared/components/Icons';
import { cn } from '@/lib/utils';

/**
 * Sends the reader to this spot in Google Maps.
 *
 * Google's cross-platform `maps/search/?api=1` URL hands off to the installed
 * Maps app on Android and iOS and falls back to the web everywhere else, so no
 * platform sniffing is needed — and unlike a `comgooglemaps://` scheme it does
 * not dead-end when the app is not installed.
 */
export const OpenInMapsLink = ({
  lat,
  lng,
  // Used when the place carries no coordinates — a name and city still find it
  query,
  className,
  children,
}: {
  lat?: number;
  lng?: number;
  query?: string;
  className?: string;
  // What reads as the link — the place's own location line, typically
  children: ReactNode;
}) => {
  const target = lat !== undefined && lng !== undefined ? `${lat},${lng}` : query?.trim();

  if (!target) return null;

  return (
    <a
      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(target)}`}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'inline-flex items-center gap-1 font-medium text-primary hover:underline',
        className,
      )}
    >
      {children}
      <IconComponent iconName="ArrowUpRight01Icon" size={14} color="currentColor" />
    </a>
  );
};
