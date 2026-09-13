'use client';

import { ReactNode, useState } from 'react';

import Image, { ImageProps } from 'next/image';

import { cn } from '@/lib/utils';

import { ImageFallback } from './ImageFallback';

/**
 * What a photo looks like before it arrives: a 4×4 PNG of a soft neutral
 * gradient, 88 bytes, which `next/image` blows up behind a Gaussian blur.
 *
 * It is the same for every photo because nothing on the client can know a
 * remote image's colours without downloading it first, and the API sends no
 * dominant colour or LQIP. A real blur-up would come from the API's
 * `photo_webp_thumb_url`, which is generated for almost nothing in the library
 * today — when that is backfilled, a caller can pass it as `blurDataURL` and
 * this constant stops being used for that surface.
 *
 * Lighter at the top than the bottom: it reads as a photograph rather than as
 * a grey box, without leaning on a colour that would clash once the real image
 * lands.
 */
export const PHOTO_PLACEHOLDER_BLUR =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAIAAAAmkwkpAAAAH0lEQVR42mN4+fwJHDE8enAXjhhu3bgKRwyXL56DIwBGLCkx6HiKjQAAAABJRU5ErkJggg==';

// Below this, `next/image` warns that a placeholder costs more than it saves —
// and blurring something the size of an avatar is a flicker, not a fade
const MIN_AREA_FOR_BLUR = 1600;

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
  placeholder,
  blurDataURL,
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

  // A bare storage key — "experiences/photos/abc.jpg" — is neither a URL nor a
  // rooted path, and next/image throws on it during render rather than firing
  // onError, taking the page down with it. Treated as a missing photo instead.
  const isUnusablePath =
    typeof src === 'string' && src !== '' && !/^(https?:\/\/|\/|data:|blob:)/.test(src);

  // Narrowed inline rather than via a helper so TypeScript can see that `src`
  // is non-null on the rendering path below
  if (hasError || isUnusablePath || src === null || src === undefined || src === '') {
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

  // Anything with real dimensions that are too small to blur usefully — an
  // avatar, an icon — keeps the plain treatment
  const area =
    typeof props.width === 'number' && typeof props.height === 'number'
      ? props.width * props.height
      : undefined;
  const canBlur = area === undefined || area >= MIN_AREA_FOR_BLUR;

  const blur =
    placeholder || !canBlur
      ? { placeholder, blurDataURL }
      : { placeholder: 'blur' as const, blurDataURL: blurDataURL ?? PHOTO_PLACEHOLDER_BLUR };

  return (
    <Image
      src={src}
      alt={alt}
      onError={(event) => {
        setHasError(true);
        onError?.(event);
      }}
      {...blur}
      {...props}
    />
  );
};
