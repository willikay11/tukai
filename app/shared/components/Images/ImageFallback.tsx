import { CSSProperties } from 'react';

import { IconComponent } from '@/app/shared/components/Icons';
import { cn } from '@/lib/utils';

/**
 * Shown in place of a photo that failed to load — a broken CDN link, a deleted
 * upload, an offline client. Deliberately quiet: it fills the space the photo
 * would have taken so the layout does not collapse, without drawing attention
 * to a failure the reader can do nothing about.
 */
export const ImageFallback = ({
  label,
  iconSize = 24,
  className,
  style,
}: {
  // Only worth showing where the photo is the point of the surface; on small
  // tiles the icon alone reads better than clipped text.
  label?: string;
  iconSize?: number;
  className?: string;
  // Only for a runtime aspect ratio Tailwind cannot express statically — see
  // PhotoImage, which uses it to hold a masonry tile's shape open
  style?: CSSProperties;
}) => (
  <div
    className={cn(
      'flex h-full w-full flex-col items-center justify-center gap-1.5 bg-gray-50 text-gray-400',
      className,
    )}
    style={style}
    // The photo is missing, not the meaning — callers carry their own labels
    aria-hidden="true"
  >
    <IconComponent iconName="ImageNotFound01Icon" size={iconSize} color="currentColor" />
    {label && <span className="px-2 text-center text-xs">{label}</span>}
  </div>
);
