'use client';
import React, { useEffect, useState } from 'react';

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import TukaiImage from '@/components/ui/image';
import { cn } from '@/lib/utils';


const ImageCarousel = ({
  images,
  width = 'w-full',
  aspectRatio = "aspect-square",
  className,
}: {
  images: string[];
  width?: string;
  aspectRatio?: string;
  className?: string;
}) => {
  const [isScrolling, setIsScrolling] = useState(false);
  const [scrollTimeout, setScrollTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolling(true);

      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }

      const timeout = setTimeout(() => {
        setIsScrolling(false);
      }, 150);

      setScrollTimeout(timeout);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
    };
  }, [scrollTimeout]);

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    e.nativeEvent.stopImmediatePropagation();
  };

  return (
    <div className={cn('group relative', width, className)}>
      <Carousel className={cn(width)}>
        <CarouselContent>
          {images.map((image, index) => (
            <CarouselItem key={index}>
              <div
                className={cn('relative', width, className, aspectRatio)}
              >
                <TukaiImage src={image} alt={`Image ${index + 1}`} className="rounded-[8px]" />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        {images.length > 1 && (
          <>
            <button
              type="button"
              className={cn(
                'pointer-events-auto absolute left-1 top-1/2 z-50 -translate-y-1/2 transform opacity-0 transition-opacity duration-300 group-hover:opacity-100',
                {
                  '!opacity-0': isScrolling,
                },
              )}
              onClick={handleButtonClick}
            >
              <CarouselPrevious className={cn('left-0')} />
            </button>
            <button
              type="button"
              className={cn(
                'pointer-events-auto absolute right-1 top-1/2 z-50 -translate-y-1/2 transform opacity-0 transition-opacity duration-300 group-hover:opacity-100',
                {
                  '!opacity-0': isScrolling,
                },
              )}
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
