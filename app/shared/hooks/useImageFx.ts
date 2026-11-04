'use client';

import { AnimationEvent, SyntheticEvent, useCallback, useRef, useState } from 'react';

/**
 * Where a photo is in loading, held on the `<img>` as `data-fx` and read by the
 * `tkSkel` / `tkImgIn` rules in globals.css:
 *
 * - `wait` - not loaded yet; the image's own box pulses
 * - `in`   - just loaded; the fade in runs
 * - `done` - finished, cached on arrival, or failed; shown as is
 * - `off`  - never animated
 */
export type ImageFxState = 'wait' | 'in' | 'done' | 'off';

// Upload previews should appear the instant they are picked, and SVGs are
// icons and brand art rather than photos
const SKIPPED_SRC = /^(data:|blob:)|\.svg(\?|$)/i;

// A static import is a bundled asset - brand art, an illustration - not a photo
// the reader is waiting on
const startState = (src: unknown): ImageFxState =>
  typeof src === 'string' && src !== '' && !SKIPPED_SRC.test(src) ? 'wait' : 'off';

const isSet = (value: string) => value !== '' && value !== 'none';

type Handlers = {
  onLoad?: (event: SyntheticEvent<HTMLImageElement>) => void;
  onError?: (event: SyntheticEvent<HTMLImageElement>) => void;
  onAnimationEnd?: (event: AnimationEvent<HTMLImageElement>) => void;
};

/**
 * The image loading animation from the design handoff: a soft pulse while the
 * photo downloads, then a 2s fade in from transparent, blurred and slightly
 * enlarged. Spread the result onto the `<img>` (or `next/image`); the caller's
 * own handlers are passed in so they still run.
 *
 * An image that already carries a filter (a closed place in grayscale) or a
 * transform of its own fades opacity only - the fade's blur and scale would
 * otherwise replace them for 2s, and a tilted photo would swing into place.
 */
export const useImageFx = (src: unknown, handlers: Handlers = {}) => {
  const [state, setState] = useState<ImageFxState>(() => startState(src));
  const [fadeOnly, setFadeOnly] = useState(false);

  // The handlers handed back must keep their identity across renders: next/image
  // rebuilds its own ref callback whenever `onError` changes, which re-runs the
  // ref below, whose setState renders again - an endless loop with inline
  // handlers. The caller's latest ones are read through this instead.
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  // A new photo starts over: it pulses and fades like a fresh one unless the
  // browser already has it, which the ref below picks up
  const [prevSrc, setPrevSrc] = useState(src);
  if (src !== prevSrc) {
    setPrevSrc(src);
    setState(startState(src));
  }

  const ref = useCallback(
    (img: HTMLImageElement | null) => {
      if (!img) return;

      const { filter, transform } = getComputedStyle(img);
      setFadeOnly(isSet(filter) || isSet(transform));

      // Already there on mount - cached, or it arrived (or failed) before
      // hydration - so there is nothing to wait for and nothing to reveal
      if (img.complete) setState((current) => (current === 'wait' ? 'done' : current));
    },
    // Re-run for each new src, so a swapped photo is checked against the cache
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [src],
  );

  const onLoad = useCallback((event: SyntheticEvent<HTMLImageElement>) => {
    setState((current) => (current === 'wait' ? 'in' : current));
    handlersRef.current.onLoad?.(event);
  }, []);

  const onError = useCallback((event: SyntheticEvent<HTMLImageElement>) => {
    setState((current) => (current === 'off' ? current : 'done'));
    handlersRef.current.onError?.(event);
  }, []);

  const onAnimationEnd = useCallback((event: AnimationEvent<HTMLImageElement>) => {
    if (/^tkImgIn/.test(event.animationName)) setState('done');
    handlersRef.current.onAnimationEnd?.(event);
  }, []);

  return {
    ref,
    'data-fx': state,
    'data-fx-fade-only': fadeOnly || undefined,
    onLoad,
    onError,
    onAnimationEnd,
  };
};
