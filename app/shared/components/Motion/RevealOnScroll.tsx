'use client';

import { ReactNode, useCallback, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

/**
 * Fades its children up as they come into view, once.
 *
 * CSS does the animating; the observer only decides when. Anything already on
 * screen when it mounts reveals immediately — the observer reports that on its
 * first callback — so this never leaves above-the-fold content hidden.
 *
 * Without IntersectionObserver (older browsers, jsdom) it starts revealed
 * rather than never appearing at all.
 */
export const RevealOnScroll = ({
  children,
  className,
  // Staggers a run of siblings; keep it small — a reader should not wait
  delayMs = 0,
}: {
  children: ReactNode;
  className?: string;
  delayMs?: number;
}) => {
  const [isRevealed, setIsRevealed] = useState(typeof IntersectionObserver === 'undefined');
  const observerRef = useRef<IntersectionObserver | null>(null);

  const ref = useCallback((node: HTMLDivElement | null) => {
    observerRef.current?.disconnect();
    if (!node || typeof IntersectionObserver === 'undefined') return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;

        setIsRevealed(true);
        // Once revealed it stays revealed — re-animating on the way back up
        // reads as a glitch, not an effect
        observerRef.current?.disconnect();
      },
      // Starts a little before the section's edge, so it is settled by the
      // time the reader reaches it
      { rootMargin: '0px 0px -10% 0px', threshold: 0.05 },
    );

    observerRef.current.observe(node);
  }, []);

  return (
    <div
      ref={ref}
      style={delayMs ? { transitionDelay: `${delayMs}ms` } : undefined}
      className={cn(
        'transition duration-500 ease-out motion-reduce:transition-none',
        isRevealed ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0',
        // Reduced motion still gets the content, just without the movement
        'motion-reduce:translate-y-0 motion-reduce:opacity-100',
        className,
      )}
    >
      {children}
    </div>
  );
};
