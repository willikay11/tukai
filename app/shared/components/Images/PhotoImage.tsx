'use client';

import { useState } from 'react';

import Image, { ImageProps } from 'next/image';

import { cn } from '@/lib/utils';

import { ImageFallback } from './ImageFallback';

/**
 * `next/image` that degrades to {@link ImageFallback} when the photo fails to
 * load, for the user-supplied photos that make up most of the app's imagery.
 *
 * A missing `src` takes the fallback path too rather than reaching next/image,
 * which throws on a null src and on relative paths without a leading slash.
 */
export const PhotoImage = ({
  src,
  alt,
  fallbackLabel,
  fallbackIconSize,
  fallbackClassName,
  onError,
  ...props
}: Omit<ImageProps, 'src'> & {
  src: ImageProps['src'] | null | undefined;
  fallbackLabel?: string;
  fallbackIconSize?: number;
  fallbackClassName?: string;
}) => {
  const [hasError, setHasError] = useState(false);

  // Narrowed inline rather than via a helper so TypeScript can see that `src`
  // is non-null on the rendering path below
  if (hasError || src === null || src === undefined || src === '') {
    // A `fill` image is sized by its positioned parent, but one sized from its
    // own intrinsic dimensions has to keep that shape or the layout around it
    // collapses — a masonry column, for instance.
    const ratio =
      !props.fill && typeof props.width === 'number' && typeof props.height === 'number'
        ? { aspectRatio: `${props.width} / ${props.height}` }
        : undefined;

    return (
      <ImageFallback
        label={fallbackLabel}
        iconSize={fallbackIconSize}
        className={cn(ratio && 'h-auto w-full', fallbackClassName)}
        style={ratio}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      onError={(event) => {
        setHasError(true);
        onError?.(event);
      }}
      {...props}
    />
  );
};
