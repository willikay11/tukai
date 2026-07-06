'use client';

import { useCallback, useRef, useState } from 'react';

import Image from 'next/image';

import { IconComponent } from '@/app/shared/components/Icons';

interface SquarePhotoStripProps {
  photos: string[];
  className?: string;
}

export const SquarePhotoStrip = ({ photos, className = '' }: SquarePhotoStripProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const ITEM_WIDTH = 240 + 8; // image width + gap

  const scrollTo = useCallback(
    (index: number) => {
      if (!scrollRef.current) return;
      const clamped = Math.max(0, Math.min(index, photos.length - 1));
      scrollRef.current.scrollTo({
        left: clamped * ITEM_WIDTH,
        behavior: 'smooth',
      });
      setActiveIndex(clamped);
    },
    [photos.length],
  );

  const scrollPrev = useCallback(() => scrollTo(activeIndex - 1), [activeIndex, scrollTo]);
  const scrollNext = useCallback(() => scrollTo(activeIndex + 1), [activeIndex, scrollTo]);

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const index = Math.round(scrollRef.current.scrollLeft / ITEM_WIDTH);
    setActiveIndex(index);
  }, []);

  if (photos.length === 0) return null;

  if (photos.length === 1) {
    return (
      <div
        className={`relative w-full overflow-hidden rounded-lg ${className}`}
        style={{ height: '200px' }}
      >
        <Image
          src={photos[0]}
          alt="Experience photo"
          fill
          sizes="(max-width: 768px) 100vw, 480px"
          className="object-cover"
          priority
        />
      </div>
    );
  }

  return (
    <div>
      <div className="relative">
        {/* Scroll strip */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className={`overflow-x-auto scrollbar-hide ${className}`}
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          <div className="flex gap-2 pb-1">
            {photos.map((photo, index) => (
              <div
                key={index}
                className="relative flex-shrink-0 overflow-hidden rounded-lg"
                style={{
                  width: '240px',
                  height: '240px',
                }}
              >
                <Image
                  src={photo}
                  alt={`Experience photo ${index + 1}`}
                  fill
                  sizes="240px"
                  className="object-cover"
                  priority={index === 0}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Left arrow */}
        {/* {activeIndex > 0 && (
          <button
            type="button"
            onClick={scrollPrev}
            className="absolute flex justify-center items-center left-2 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full border-2 border-gray-200 bg-white hover:bg-gray-50 transition-colors"
            aria-label="Previous photo"
          >
            <IconComponent iconName="ArrowLeft01TwotoneRounded" size={20} className="text-gray-600" />
          </button>
        )} */}

        {/* Right arrow */}
        {/* {activeIndex < photos.length - 1 && (
          <button
            type="button"
            onClick={scrollNext}
            className="absolute flex justify-center items-center right-2 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full border-2 border-gray-200 bg-white hover:bg-gray-50 transition-colors"
            aria-label="Next photo"
          >
            <IconComponent iconName="ArrowRight01TwotoneRounded" size={20} className="text-gray-600" />
          </button>
        )} */}
      </div>
    </div>
  );
};
