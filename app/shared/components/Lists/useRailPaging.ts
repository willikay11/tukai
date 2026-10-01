'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Paging a horizontal rail from the arrows in its section header.
 *
 * The canvas scrolls by a page at a time and greys each arrow at its end, so
 * the rail has to report where it is. Scroll position is read rather than
 * counted: the cards size themselves, and a count would drift the moment one
 * row used a different width.
 */
export const useRailPaging = <T extends HTMLElement = HTMLDivElement>() => {
  const ref = useRef<T | null>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(true);

  const measure = useCallback(() => {
    const rail = ref.current;
    if (!rail) return;

    const max = rail.scrollWidth - rail.clientWidth;

    setAtStart(rail.scrollLeft <= 1);
    // A rail with nothing to scroll is at both ends at once, which is what
    // greys both arrows
    setAtEnd(max <= 1 || rail.scrollLeft >= max - 1);
  }, []);

  useEffect(() => {
    const rail = ref.current;
    if (!rail) return;

    measure();
    rail.addEventListener('scroll', measure, { passive: true });

    // The rail's own width and its contents both move the ends
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure);
    observer?.observe(rail);

    return () => {
      rail.removeEventListener('scroll', measure);
      observer?.disconnect();
    };
  }, [measure]);

  const page = useCallback((direction: 1 | -1) => {
    const rail = ref.current;
    if (!rail) return;

    // Just under a full width, so the card at the edge stays in view and the
    // reader keeps their place
    rail.scrollBy({ left: direction * rail.clientWidth * 0.9, behavior: 'smooth' });
  }, []);

  return {
    ref,
    atStart,
    atEnd,
    onBack: useCallback(() => page(-1), [page]),
    onNext: useCallback(() => page(1), [page]),
    /** For a caller that re-renders the rail's contents. */
    measure,
  };
};
