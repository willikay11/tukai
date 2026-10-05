import { ReactNode } from 'react';

import { IconComponent } from '@/app/shared/components/Icons';
import { cn } from '@/lib/utils';
import { mapsHref } from '@/utils/maps';

/** Sends the reader to this spot in Google Maps. See {@link mapsHref}. */
export const OpenInMapsLink = ({
  lat,
  lng,
  // Used when the place carries no coordinates - a name and city still find it
  query,
  className,
  children,
}: {
  lat?: number;
  lng?: number;
  query?: string;
  className?: string;
  // What reads as the link - the place's own location line, typically
  children: ReactNode;
}) => {
  const href = mapsHref({ lat, lng, query });

  if (!href) return null;

  return (
    <a
      href={href}
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
