'use client';

import { ImgHTMLAttributes } from 'react';

import { useImageFx } from '@/app/shared/hooks/useImageFx';

/**
 * A plain `<img>` that loads like every other photo in the app - a pulse, then
 * a fade in (see {@link useImageFx}) - for the places that can't go through
 * `next/image`: remote hosts it isn't configured for, and upload previews,
 * which skip the animation and show at once.
 */
export const PlainImage = ({
  src,
  alt,
  onLoad,
  onError,
  onAnimationEnd,
  ...props
}: ImgHTMLAttributes<HTMLImageElement> & { alt: string }) => {
  const fx = useImageFx(src, { onLoad, onError, onAnimationEnd });

  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} {...props} {...fx} />;
};
