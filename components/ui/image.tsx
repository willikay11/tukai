'use client';

import { useState } from 'react';

import Image, { ImageProps } from 'next/image';

import clsx from 'clsx';

import { ImageFallback } from '@/app/shared/components/Images';
import { useImageFx } from '@/app/shared/hooks/useImageFx';

export const TukaiImage = ({
  src,
  alt,
  showNotFoundText = true,
  className: passedClassName,
  onLoad,
  onError,
  onAnimationEnd,
  ...props
}: ImageProps & { showNotFoundText?: boolean }) => {
  const [hasError, setHasError] = useState(false);
  // The pulse and fade every other photo in the app loads with, so a card in
  // the carousel and a card beside it resolve the same way
  const fx = useImageFx(src, {
    onLoad,
    onError: (event) => {
      setHasError(true);
      onError?.(event);
    },
    onAnimationEnd,
  });

  return (
    <>
      {!hasError && (
        <Image
          src={src}
          alt={alt}
          quality={100}
          fill
          className={clsx('carousel-image object-cover', passedClassName)}
          // `priority` and `loading="lazy"` together throw, and props spread
          // after this line - so the default only applies when nothing above
          // the fold has asked for the opposite
          {...(props.priority ? {} : { loading: 'lazy' as const })}
          {...props}
          {...fx}
        />
      )}
      {hasError && (
        <ImageFallback
          label={showNotFoundText ? 'Image not available' : undefined}
          className={clsx('absolute inset-0', passedClassName)}
        />
      )}
    </>
  );
};
