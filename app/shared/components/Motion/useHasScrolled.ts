'use client';

import { useEffect, useState } from 'react';

/**
 * Whether the page has scrolled past `threshold`.
 *
 * For decorations that need to know the reader has moved — a sticky panel
 * lifting off the page, say. Passive listener, and it reads once on mount so
 * the answer is right for a page restored mid-scroll.
 */
export const useHasScrolled = (threshold = 200, enabled = true): boolean => {
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    const update = () => setHasScrolled(window.scrollY > threshold);

    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, [threshold, enabled]);

  return hasScrolled;
};
