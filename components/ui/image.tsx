'use client';

import { useState } from 'react';

import Image, { ImageProps } from 'next/image';

import clsx from 'clsx';

import { AvatarSkeleton } from '@/app/shared/components/Cards/Skeletons';
import { ImageFallback, PHOTO_PLACEHOLDER_BLUR } from '@/app/shared/components/Images';

export const TukaiImage = ({
  src,
  alt,
  showNotFoundText = true,
  className: passedClassName,
  placeholder,
  blurDataURL,
  ...props
}: ImageProps & { showNotFoundText?: boolean }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <>
      {/* The blur below stands in for the photo itself; the skeleton stays for
          the moment before next/image has painted anything at all */}
      {!isLoaded && !hasError && <AvatarSkeleton />}
      {!hasError && (
        <Image
          src={src}
          alt={alt}
          quality={100}
          fill
          className={clsx(
            'carousel-image object-cover opacity-0 transition-opacity duration-300',
            passedClassName,
          )}
          // The same soft placeholder the rest of the app's photos use, so a
          // card in the carousel and a card beside it resolve the same way
          placeholder={placeholder ?? 'blur'}
          blurDataURL={blurDataURL ?? PHOTO_PLACEHOLDER_BLUR}
          onLoad={(e) => {
            e.currentTarget.classList.remove('opacity-0');
            setIsLoaded(true);
          }}
          onError={() => {
            setHasError(true);
            setIsLoaded(true);
          }}
          // `priority` and `loading="lazy"` together throw, and props spread
          // after this line — so the default only applies when nothing above
          // the fold has asked for the opposite
          {...(props.priority ? {} : { loading: 'lazy' as const })}
          {...props}
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
