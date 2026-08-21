'use client';

import { ReactNode, useState } from 'react';

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
  fallback,
  fallbackLabel,
  fallbackIconSize,
  fallbackClassName,
  onError,
  ...props
}: Omit<ImageProps, 'src'> & {
  src: ImageProps['src'] | null | undefined;
  // Something better than a broken-image icon, where the surface has one —
  // an avatar's initial, say. Takes precedence over the label and icon.
  fallback?: ReactNode;
  fallbackLabel?: string;
  fallbackIconSize?: number;
  fallbackClassName?: string;
}) => {
  const [hasError, setHasError] = useState(false);

  // Narrowed inline rather than via a helper so TypeScript can see that `src`
  // is non-null on the rendering path below
  if (hasError || src === null || src === undefined || src === '') {
    if (fallback) return <>{fallback}</>;

    // A `fill` image is taken out of flow and stretched over its positioned
    // parent, so the fallback has to be too — left in flow it would push the
    // parent's other content down instead of sitting behind it.
    //
    // An image sized from its own intrinsic dimensions has the opposite need:
    // keep that shape, or the layout around it collapses — a masonry column,
    // for instance.
    const ratio =
      !props.fill && typeof props.width === 'number' && typeof props.height === 'number'
        ? { aspectRatio: `${props.width} / ${props.height}` }
        : undefined;

    return (
      <ImageFallback
        label={fallbackLabel}
        iconSize={fallbackIconSize}
        className={cn(
          props.fill && 'absolute inset-0',
          ratio && 'h-auto w-full',
          fallbackClassName,
        )}
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
