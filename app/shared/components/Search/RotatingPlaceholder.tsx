'use client';

import { useEffect, useState } from 'react';

import { cn } from '@/lib/utils';

const PHRASES = ['Find experiences', 'Find places', 'Find communities', 'Find activities'];

// Matches the field's leading-[18px], so each phrase occupies exactly one line
// box and the reel lands cleanly on every step
const SLOT_HEIGHT = 18;
const HOLD_MS = 2500;
const SLIDE_MS = 500;

/**
 * The search field's placeholder, as a reel: the current phrase scrolls up and
 * out while the next rises in behind it.
 *
 * A real `placeholder` attribute cannot be animated, so this is drawn over the
 * empty field instead and the input carries an aria-label for its name. It is
 * decorative — hidden from assistive tech, which reads that label.
 */
export const RotatingPlaceholder = ({
  visible,
  phrases = PHRASES,
}: {
  // The field's own text must never have this sitting behind it
  visible: boolean;
  phrases?: string[];
}) => {
  const [index, setIndex] = useState(0);
  const [isSliding, setIsSliding] = useState(true);

  useEffect(() => {
    if (!visible) return;

    const timer = setInterval(() => setIndex((current) => current + 1), HOLD_MS);
    return () => clearInterval(timer);
  }, [visible]);

  // The first phrase is repeated at the end of the reel, so the last-to-first
  // step slides the same way as every other one. Once it lands on that copy,
  // the reel jumps back to the real first slot with the transition off, which
  // is invisible because the two slots are identical.
  useEffect(() => {
    if (index !== phrases.length) return;

    const timer = setTimeout(() => {
      setIsSliding(false);
      setIndex(0);
    }, SLIDE_MS);
    return () => clearTimeout(timer);
  }, [index, phrases.length]);

  useEffect(() => {
    if (isSliding) return;

    // Restore the transition only after the jump has painted, or it animates
    const frame = requestAnimationFrame(() => setIsSliding(true));
    return () => cancelAnimationFrame(frame);
  }, [isSliding]);

  if (!visible) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-y-0 left-0 flex items-center"
    >
      <div className="overflow-hidden" style={{ height: SLOT_HEIGHT }}>
        <div
          className={cn(
            'will-change-transform',
            isSliding && 'transition-transform duration-500 ease-in-out',
            // Readers who ask for less motion get the phrases swapped, not slid
            'motion-reduce:transition-none',
          )}
          // Runtime offset — no static Tailwind class can express it
          style={{ transform: `translateY(-${index * SLOT_HEIGHT}px)` }}
        >
          {[...phrases, phrases[0]].map((phrase, slot) => (
            <div
              key={`${phrase}-${slot}`}
              className="flex items-center whitespace-nowrap text-[14px] font-normal leading-[18px] text-gray-400"
              style={{ height: SLOT_HEIGHT }}
            >
              {phrase}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
