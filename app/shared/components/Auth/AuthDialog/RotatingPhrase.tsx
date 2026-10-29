'use client';

import { useEffect, useState } from 'react';

const PHRASES = ['night life', 'weekend hikes', 'art in the city', 'new places to eat'];

const LONGEST = PHRASES.reduce((a, b) => (b.length > a.length ? b : a), '');

/**
 * The welcome headline's second line: "Plan & discover {phrase}".
 *
 * Stacks the outgoing and incoming phrase in one grid cell over an invisible
 * copy of the longest phrase, so cycling never changes the headline's height.
 * `globals.css` already collapses every `animate-*` class to near-zero under
 * `prefers-reduced-motion`, which is what turns this into a plain word swap
 * for anyone who asked for less motion - see AU-00 decision 11.
 */
export const RotatingPhrase = ({ active }: { active: boolean }) => {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!active) return;

    const id = setInterval(() => setTick((t) => t + 1), 3000);
    return () => clearInterval(id);
  }, [active]);

  const current = PHRASES[tick % PHRASES.length];
  const previous = PHRASES[(tick + PHRASES.length - 1) % PHRASES.length];

  let letterIndex = 0;

  return (
    <span className="relative block">
      {/* The only copy a screen reader sees - the animated one below is aria-hidden */}
      <span className="sr-only">{current}</span>

      <span aria-hidden="true" className="grid text-lime">
        <span className="invisible" style={{ gridArea: '1 / 1' }}>
          {LONGEST}
        </span>

        {tick > 0 && (
          <span
            key={`out-${tick}`}
            style={{ gridArea: '1 / 1' }}
            className="animate-auth-word-out"
          >
            {previous}
          </span>
        )}

        <span key={`in-${tick}`} style={{ gridArea: '1 / 1' }}>
          {current.split(' ').map((word, wi, words) => (
            <span key={wi} className="inline-block whitespace-nowrap">
              {word.split('').map((ch, ci) => (
                <span
                  key={ci}
                  className="inline-block animate-auth-letter-in"
                  style={{ animationDelay: `${140 + 26 * letterIndex++}ms` }}
                >
                  {ch}
                </span>
              ))}
              {wi < words.length - 1 ? ' ' : null}
            </span>
          ))}
        </span>
      </span>
    </span>
  );
};
