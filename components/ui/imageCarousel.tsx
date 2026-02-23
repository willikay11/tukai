'use client';
import React, { useEffect, useState } from 'react';

import {
  CarouselApi,
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
  aspectRatio = 'aspect-square',
  className,
}: {
  images: string[];
  width?: string;
  aspectRatio?: string;
  className?: string;
}) => {
  const [isScrolling, setIsScrolling] = useState(false);
  const [scrollTimeout, setScrollTimeout] = useState<NodeJS.Timeout | null>(null);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [selectedIndex, setSelectedIndex] = useState(0);

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

  useEffect(() => {
    if (!carouselApi) {
      return;
    }

    const onSelect = () => {
      setSelectedIndex(carouselApi.selectedScrollSnap());
    };

    onSelect();
    carouselApi.on('select', onSelect);
    carouselApi.on('reInit', onSelect);

    return () => {
      carouselApi.off('select', onSelect);
      carouselApi.off('reInit', onSelect);
    };
  }, [carouselApi]);

  return (
    <div className={cn('group relative', width, className)}>
      <Carousel className={cn(width)} setApi={setCarouselApi}>
        <CarouselContent>
          {images.map((image, index) => (
            <CarouselItem key={index}>
              <div className={cn('relative', width, className, aspectRatio)}>
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
            <div className="pointer-events-auto absolute bottom-3 left-1/2 z-40 flex -translate-x-1/2 items-center gap-1.5">
              {images.map((_, index) => {
                const isActive = index === selectedIndex;

                return (
                  <button
                    key={`dot-${index}`}
                    type="button"
                    className={cn(
                      'h-1.5 w-1.5 rounded-full transition-all duration-200',
                      isActive ? 'bg-white opacity-100' : 'bg-white/60 opacity-90 hover:opacity-100',
                    )}
                    onClick={(e) => {
                      handleButtonClick(e);
                      carouselApi?.scrollTo(index);
                    }}
                    aria-label={`Go to image ${index + 1}`}
                    aria-current={isActive ? 'true' : undefined}
                  />
                );
              })}
            </div>
          </>
        )}
      </Carousel>
    </div>
  );
};

export default ImageCarousel;
