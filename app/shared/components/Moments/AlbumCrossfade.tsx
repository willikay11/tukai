'use client';

import { useEffect, useRef, useState } from 'react';

import { PhotoImage } from '@/app/shared/components/Images';
import { cn } from '@/lib/utils';

/** The dots stop at ten, which is also the most photos an album holds. */
const MAX_DOTS = 10;

/** From the pointer arriving to the second photo starting to fade in. */
const FIRST_STEP_MS = 300;

/** Between each photo after that, looping. */
const STEP_MS = 1300;

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);

/**
 * An album's cover: its first photo with a dot per photo, playing through the
 * rest while `isPlaying` is on.
 *
 * At rest only the first photo is loaded. Hovering loads the others and, after
 * a beat, fades each one in over the last; leaving fades back to the first.
 * The first photo never moves - every other one is stacked over it, so a fade
 * back to it is the top photo fading out rather than the first fading in.
 *
 * With reduced motion it stays on the first photo.
 */
export const AlbumCrossfade = ({
  photos,
  isPlaying,
  sizes,
  priority = false,
}: {
  photos: string[];
  /** The caller owns hover, so the whole photo button starts it. */
  isPlaying: boolean;
  sizes: string;
  priority?: boolean;
}) => {
  const count = photos.length;
  const [{ current, previous }, setStep] = useState({ current: 0, previous: 0 });
  // Once hovered, every photo stays mounted, so a second hover does not wait
  // on the network again
  const [hasLoadedAll, setHasLoadedAll] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isPlaying) {
      setStep((step) => (step.current === 0 ? step : { current: 0, previous: step.current }));
      return;
    }

    setHasLoadedAll(true);
    if (count < 2 || prefersReducedMotion()) return;

    const advance = () => {
      setStep((step) => ({ current: (step.current + 1) % count, previous: step.current }));
      timer.current = setTimeout(advance, STEP_MS);
    };
    timer.current = setTimeout(advance, FIRST_STEP_MS);

    return () => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = null;
    };
  }, [isPlaying, count]);

  return (
    <span className="relative isolate block h-full w-full overflow-hidden">
      {photos.slice(0, hasLoadedAll ? count : 1).map((src, index) => {
        const isFirst = index === 0;
        const isCurrent = index === current;
        const isPrevious = index === previous && !isCurrent;
        const isShown = isFirst || isCurrent || (isPrevious && current !== 0);
        // Only the photo arriving, or the one leaving to reveal the first,
        // fades; the rest change under it unseen
        const fades = (isCurrent && !isFirst) || (isPrevious && current === 0);

        return (
          <PhotoImage
            key={`${src}-${index}`}
            src={src}
            alt=""
            aria-hidden={isFirst ? undefined : true}
            fill
            sizes={sizes}
            priority={isFirst && priority}
            className={cn(
              'object-cover motion-reduce:transform-none',
              fades
                ? '[transition:opacity_.6s_ease,transform_.45s_ease]'
                : '[transition:transform_.45s_ease]',
              isCurrent && !isFirst ? 'z-[2]' : isPrevious ? 'z-[1]' : 'z-0',
              isShown ? 'opacity-100' : 'opacity-0',
              isPlaying && 'scale-[1.04]',
            )}
          />
        );
      })}

      {count > 1 && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-2.5 z-[3] flex justify-center gap-[5px]"
        >
          {photos.slice(0, MAX_DOTS).map((src, index) => (
            <span
              key={`${src}-${index}`}
              data-current={index === current || undefined}
              className={cn(
                'h-1.5 w-1.5 rounded-full shadow-[0_1px_3px_rgba(0,0,0,.35)] transition-colors duration-300',
                index === current ? 'bg-white' : 'bg-white/50',
              )}
            />
          ))}
        </span>
      )}
    </span>
  );
};
