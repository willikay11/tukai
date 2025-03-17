'use client';
import { ImageSkeleton } from '@/app/components/skeletons';
import { cn } from '@/lib/utils';
import Image, { ImageProps } from 'next/image';
import { useState } from 'react';
export default function TukaiImage({ src, alt, ...props }: ImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  return (
    <div className={cn('relative aspect-square w-full')}>
      {!isLoaded && <ImageSkeleton />}
      <Image
        src={src}
        alt={alt}
        quality={100}
        layout="fill"
        objectFit="cover"
        className="carousel-image rounded-[8px] opacity-0 transition-opacity duration-300"
        onLoadingComplete={(image) => {
          image.classList.remove('opacity-0');
          setIsLoaded(true);
        }}
        loading="lazy"
        {...props}
      />
    </div>
  );
}
