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

const ImageCarousel = ({ images, imageHeight }: { images: string[]; imageHeight: string }) => {
  return (
    <div className="group relative">
      <Carousel>
        <CarouselContent className="relative">
          {images.map((image, index) => (
            <CarouselItem key={index}>
              <div
                className={cn(
                  'relative aspect-square w-full',
                  imageHeight,
                  images.length - 1 === index ? 'ml-[1rem]' : '',
                )}
              >
                <Image
                  src={image}
                  alt={`Image ${index + 1}`}
                  quality={100}
                  layout="fill"
                  objectFit="cover"
                  className="carousel-image rounded-[8px]"
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="absolute left-1 top-1/2 z-10 -translate-y-1/2 transform opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <CarouselPrevious className={cn('left-0')} />
        </div>
        <div className="absolute right-1 top-1/2 z-10 -translate-y-1/2 transform opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <CarouselNext className={cn('right-0')} />
        </div>
      </Carousel>
    </div>
  );
};

export default ImageCarousel;
