'use client';

import { useState } from 'react';

import Image, { ImageProps } from 'next/image';

import clsx from 'clsx';

import { AvatarSkeleton } from '@/app/shared/components/Cards/Skeletons';
import { ImageFallback } from '@/app/shared/components/Images';

export const TukaiImage = ({
  src,
  alt,
  showNotFoundText = true,
  className: passedClassName,
  ...props
}: ImageProps & { showNotFoundText?: boolean }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <>
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
          onLoad={(e) => {
            e.currentTarget.classList.remove('opacity-0');
            setIsLoaded(true);
          }}
          onError={() => {
            setHasError(true);
            setIsLoaded(true);
          }}
          loading="lazy"
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
