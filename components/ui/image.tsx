'use client';

import { useState } from 'react';

import Image, { ImageProps } from 'next/image';

import clsx from 'clsx';

import { ImageSkeleton } from '@/app/components/skeletons';

export const TukaiImage = ({
  src,
  alt,
  showNotFoundText = true,
  ...props
}: ImageProps & { showNotFoundText?: boolean }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <>
      {!isLoaded && !hasError && <ImageSkeleton />}
      {!hasError && (
        <Image
          src={src}
          alt={alt}
          quality={100}
          layout="fill"
          objectFit="cover"
          className={clsx(
            'carousel-image opacity-0 transition-opacity duration-300',
            props?.className,
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
        <div
          className={clsx(
            'absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-500',
            props.className,
          )}
        >
          {showNotFoundText && <span className="text-center text-sm">Image not available</span>}
        </div>
      )}
    </>
  );
};

