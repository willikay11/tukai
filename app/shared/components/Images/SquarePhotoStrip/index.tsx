'use client';

import { useCallback, useRef, useState } from 'react';

import { IconComponent } from '@/app/shared/components/Icons';
import { PhotoImage } from '@/app/shared/components/Images/PhotoImage';

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

  // Every hook has to run before the early returns below. These used to sit
  // inside the variant branches, past `photos.length === 0`, so the hook count
  // changed the moment a photo appeared — which crashes any caller whose photo
  // list starts empty and fills in later (the create-flow preview).
  const heroScrollTo = useCallback((index: number) => {
    if (!scrollRef.current) return;
    const containerWidth = scrollRef.current.clientWidth;
    scrollRef.current.scrollTo({
      left: index * containerWidth,
      behavior: 'smooth',
    });
    setActiveIndex(index);
  }, []);

  const heroHandleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const containerWidth = scrollRef.current.clientWidth;
    const index = Math.round(scrollRef.current.scrollLeft / containerWidth);
    setActiveIndex(index);
  }, []);

  const stripHandleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const index = Math.round(scrollRef.current.scrollLeft / ITEM_WIDTH);
    setActiveIndex(index);
  }, [ITEM_WIDTH]);

  if (photos.length === 0) return null;

  // ─── Hero variant (full-width square carousel) ────────────────
  if (variant === 'hero') {
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
          onScroll={heroHandleScroll}
          className="relative aspect-[4/3] w-full overflow-x-auto rounded-2xl scrollbar-hide"
          style={{
            scrollSnapType: 'x mandatory',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          <div className="flex h-full">
            {photos.map((photo, index) => (
              <div
                key={index}
                className="relative h-full w-full flex-shrink-0"
                style={{ scrollSnapAlign: 'start' }}
              >
                <PhotoImage
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
            onClick={() => heroScrollTo(activeIndex - 1)}
            className="absolute left-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-md backdrop-blur-sm transition-colors hover:bg-white"
            aria-label="Previous photo"
          >
            <IconComponent iconName="ArrowLeft01Icon" size={18} className="text-gray-800" />
          </button>
        )}

        {/* Right arrow */}
        {activeIndex < photos.length - 1 && (
          <button
            type="button"
            onClick={() => heroScrollTo(activeIndex + 1)}
            className="absolute right-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-md backdrop-blur-sm transition-colors hover:bg-white"
            aria-label="Next photo"
          >
            <IconComponent iconName="ArrowRight01Icon" size={18} className="text-gray-800" />
          </button>
        )}

        {/* Dots — bottom center */}
        <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
          {photos.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => heroScrollTo(index)}
              className={`h-2 w-2 rounded-full transition-all ${
                index === activeIndex ? 'w-6 bg-white' : 'bg-white/50'
              }`}
              aria-label={`Photo ${index + 1}`}
            />
          ))}
        </div>
      </div>
    );
  }

  // ─── Strip variant (horizontal scroll strip) ───────────────────
  if (photos.length === 1) {
    return (
      <div
        className={`relative w-full overflow-hidden rounded-lg ${className}`}
        style={{ height: '200px' }}
      >
        <PhotoImage
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
          onScroll={stripHandleScroll}
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
                <PhotoImage
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
