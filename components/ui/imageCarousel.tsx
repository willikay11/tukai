import React from 'react';

import Image from 'next/image';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { cn } from '@/lib/utils';
import { ImageSkeleton } from '@/app/components/skeletons';

const ImageCarousel = ({ images, imageHeight }: { images: string[]; imageHeight: string }) => {
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
              <div className={cn('relative aspect-square w-full', imageHeight)}>
                <ImageSkeleton />
                <Image
                  src={image}
                  alt={`Image ${index + 1}`}
                  quality={100}
                  layout="fill"
                  objectFit="cover"
                  className="carousel-image rounded-[8px] opacity-0 transition-opacity duration-300"
                  onLoadingComplete={(image) => {
                    image.classList.remove('opacity-0');
                  }}
                  loading="lazy"
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <button 
          type="button"
          className="absolute left-1 top-1/2 z-50 -translate-y-1/2 transform opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-auto"
          onClick={handleButtonClick}
        >
          <CarouselPrevious 
            className={cn('left-0')} 
          />
        </button>
        <button 
          type="button"
          className="absolute right-1 top-1/2 z-50 -translate-y-1/2 transform opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-auto"
          onClick={handleButtonClick}
        >
          <CarouselNext 
            className={cn('right-0')} 
          />  
        </button>
      </Carousel>
    </div>
  );
};

export default ImageCarousel;
