'use client';
import React from 'react';

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import TukaiImage from '@/components/ui/image';
import { cn } from '@/lib/utils';
import { clsx } from 'clsx';

const ImageCarousel = ({
  images,
  aspectRatio = 'aspect-square',
}: {
  images: string[];
  aspectRatio?: string;
}) => {
  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    e.nativeEvent.stopImmediatePropagation();
  };

  return (
    <div className="group relative w-full">
      <Carousel className="w-full">
        <CarouselContent>
          {images.map((image, index) => (
            <CarouselItem key={index}>
              <div className={clsx(`relative w-full ${aspectRatio}`, {
                'h-[150px]': aspectRatio !== 'aspect-square',
              })}>
                <TukaiImage src={image} alt={`Image ${index + 1}`} className="rounded-[8px]" />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        {images.length > 1 && (
          <>
            <button
              type="button"
              className="pointer-events-auto absolute left-1 top-1/2 z-50 -translate-y-1/2 transform opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              onClick={handleButtonClick}
            >
              <CarouselPrevious className={cn('left-0')} />
            </button>
            <button
              type="button"
              className="pointer-events-auto absolute right-1 top-1/2 z-50 -translate-y-1/2 transform opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              onClick={handleButtonClick}
            >
              <CarouselNext className={cn('right-0')} />
            </button>
          </>
        )}
      </Carousel>
    </div>
  );
};

export default ImageCarousel;
