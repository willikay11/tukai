'use client';

import { useEffect, useRef, useState } from 'react';

import { PhotoImage } from '@/app/shared/components/Images';
import { cn } from '@/lib/utils';

import { CROSSFADE_FIRST_VIEW_MS, CROSSFADE_HOVER_MS, CROSSFADE_STEP_MS } from './itinerary-card';

/** How much of the card has to be on screen before the first play-through. */
const IN_VIEW_THRESHOLD = 0.6;

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);

/**
 * An itinerary's cover: its first stop, then each of the next ones fading in
 * over it, once, and back to the first.
 *
 * It plays when the card is first 60% on screen, after `offsetMs` more so a
 * row of cards does not move in lockstep, and again each time a mouse enters
 * it. A play-through already running is left to finish - a hover never
 * restarts it, and leaving never stops it.
 *
 * Unlike `AlbumCrossfade`, every photo mounts with the card: each step fades
 * in a photo that is already there. The first photo never moves - the others
 * stack over it, so returning to it is the last one fading out.
 *
 * With reduced motion it stays on the first photo.
 */
export const StopCrossfade = ({
  photos,
  alt,
  offsetMs = 0,
  sizes,
  priority = false,
}: {
  photos: string[];
  alt: string;
  /** Added to the first-view delay - see `crossfadeOffset`. */
  offsetMs?: number;
  sizes: string;
  priority?: boolean;
}) => {
  const count = photos.length;
  const [{ current, previous }, setStep] = useState({ current: 0, previous: 0 });
  const ref = useRef<HTMLSpanElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // One play-through: a step per photo after the first, then one more back to
  // it, and stop
  const play = (delay: number) => {
    if (count < 2 || timer.current || prefersReducedMotion()) return;

    let taken = 0;
    const step = () => {
      taken += 1;
      setStep((last) => ({ current: taken % count, previous: last.current }));
      timer.current = taken < count ? setTimeout(step, CROSSFADE_STEP_MS) : null;
    };
    timer.current = setTimeout(step, delay);
  };

  // Mirrors `play` so the observer below can stay subscribed once rather than
  // re-attaching on every render
  const playRef = useRef(play);
  playRef.current = play;

  useEffect(() => {
    const element = ref.current;
    const stop = () => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = null;
    };

    if (!element || count < 2 || typeof IntersectionObserver === 'undefined') return stop;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        playRef.current(CROSSFADE_FIRST_VIEW_MS + offsetMs);
      },
      { threshold: IN_VIEW_THRESHOLD },
    );
    observer.observe(element);

    return () => {
      observer.disconnect();
      stop();
    };
  }, [count, offsetMs]);

  return (
    <span
      ref={ref}
      // A mouse only: a tap fires pointerenter too, and on a touch screen the
      // first view is the only play-through the design asks for
      onPointerEnter={(event) => {
        if (event.pointerType === 'mouse') play(CROSSFADE_HOVER_MS);
      }}
      className="relative isolate block h-full w-full overflow-hidden"
    >
      {photos.map((src, index) => {
        const isFirst = index === 0;
        const isCurrent = index === current;
        const isPrevious = index === previous && !isCurrent;
        const isShown = isFirst || isCurrent || (isPrevious && current !== 0);
        // Only the photo arriving, or the last one leaving to uncover the
        // first, fades; the rest change under it unseen
        const fades = (isCurrent && !isFirst) || (isPrevious && current === 0);

        return (
          <PhotoImage
            key={`${src}-${index}`}
            src={src}
            alt={isFirst ? alt : ''}
            aria-hidden={isFirst ? undefined : true}
            fill
            sizes={sizes}
            priority={priority}
            className={cn(
              'object-cover',
              fades && '[transition:opacity_.9s_ease]',
              isCurrent && !isFirst ? 'z-[2]' : isPrevious ? 'z-[1]' : 'z-0',
              isShown ? 'opacity-100' : 'opacity-0',
            )}
          />
        );
      })}
    </span>
  );
};
