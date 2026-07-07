'use client';

import { useCallback, useRef, useState } from 'react';

import Image from 'next/image';

import { IconComponent } from '@/app/shared/components/Icons';

interface SquarePhotoStripProps {
  photos: string[];
  variant?: 'strip' | 'hero';
  className?: string;
}

export const SquarePhotoStrip = ({
  photos,
  variant = 'strip',
  className = '',
}: SquarePhotoStripProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const ITEM_WIDTH = 240 + 8; // image width + gap

  if (photos.length === 0) return null;

  // ─── Hero variant (full-width square carousel) ────────────────
  if (variant === 'hero') {
    const scrollTo = useCallback(
      (index: number) => {
        if (!scrollRef.current) return;
        const containerWidth = scrollRef.current.clientWidth;
        scrollRef.current.scrollTo({
          left: index * containerWidth,
          behavior: 'smooth',
        });
        setActiveIndex(index);
      },
      [],
    );

    const handleScroll = useCallback(() => {
      if (!scrollRef.current) return;
      const containerWidth = scrollRef.current.clientWidth;
      const index = Math.round(scrollRef.current.scrollLeft / containerWidth);
      setActiveIndex(index);
    }, []);

    // Single image — no arrows or dots
    // if (photos.length === 1) {
    //   return (
    //     <div
    //       className={`relative w-full aspect-[4/3] overflow-hidden rounded-2xl ${className}`}
    //     >
    //       <Image
    //         src={photos[0]}
    //         alt="Experience photo"
    //         fill
    //         sizes="(max-width: 768px) 100vw, 800px"
    //         className="object-cover"
    //         priority
    //       />
    //     </div>
    //   );
    // }

    // Multiple images — carousel with arrows and dots
    return (
      <div className={`relative ${className}`}>
        {/* 4:3 scroll container */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="relative w-full aspect-[4/3] overflow-x-auto scrollbar-hide rounded-2xl"
          style={{
            scrollSnapType: 'x mandatory',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          <div className="flex h-full">
            {photos.map((photo, index) => (
              <div
                key={index}
                className="relative flex-shrink-0 w-full h-full"
                style={{ scrollSnapAlign: 'start' }}
              >
                <Image
                  src={photo}
                  alt={`Experience photo ${index + 1}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 800px"
                  className="object-cover"
                  priority={index === 0}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Left arrow */}
        {activeIndex > 0 && (
          <button
            type="button"
            onClick={() => scrollTo(activeIndex - 1)}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md hover:bg-white transition-colors z-10"
            aria-label="Previous photo"
          >
            <IconComponent iconName="ArrowLeft01Icon" size={18} className="text-gray-800" />
          </button>
        )}

        {/* Right arrow */}
        {activeIndex < photos.length - 1 && (
          <button
            type="button"
            onClick={() => scrollTo(activeIndex + 1)}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md hover:bg-white transition-colors z-10"
            aria-label="Next photo"
          >
            <IconComponent iconName="ArrowRight01Icon" size={18} className="text-gray-800" />
          </button>
        )}

        {/* Dots — bottom center */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {photos.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => scrollTo(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === activeIndex ? 'bg-white w-6' : 'bg-white/50'
              }`}
              aria-label={`Photo ${index + 1}`}
            />
          ))}
        </div>
      </div>
    );
  }

  // ─── Strip variant (horizontal scroll strip) ───────────────────
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

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const index = Math.round(scrollRef.current.scrollLeft / ITEM_WIDTH);
    setActiveIndex(index);
  }, []);

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
      </div>
    </div>
  );
};
