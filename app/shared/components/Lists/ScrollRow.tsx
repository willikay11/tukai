'use client';

import { forwardRef, useCallback, useEffect, useRef } from 'react';

import { RAIL_CARD_WIDTH_VAR, railCardWidth } from './railCardWidth';

// Native horizontal scroller - unlike the embla carousel it responds to
// trackpad/wheel scrolling and keyboard as well as touch drag.
//
// It measures itself and writes the width that fits whole cards - never fewer
// than two - into --rail-card-w, remeasured as it resizes. Cards sized with
// RAIL_CARD_RESPONSIVE_WIDTH read it; a card with its own fixed width keeps it.
//
// `overflow-x-auto` also clips vertically, which would cut off the drop shadow
// on cards that carry one (see SeeAllCard) - most visibly on short rows like
// the cities row, where the card's height leaves the shadow flush with the
// bottom edge. The vertical padding gives the shadow room inside the scroll
// box and the matching negative margins take that room back out of the layout,
// so surrounding spacing is unchanged. `pr-4` does the same for the last card's
// right-hand shadow, and needs no counterpart since it only extends how far
// the row scrolls.
export const ScrollRow = forwardRef<HTMLDivElement, { children: React.ReactNode }>(
  ({ children }, ref) => {
    const rowRef = useRef<HTMLDivElement | null>(null);

    // Both the paging hook's ref and this one's own
    const setRef = useCallback(
      (node: HTMLDivElement | null) => {
        rowRef.current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
      },
      [ref],
    );

    useEffect(() => {
      const row = rowRef.current;
      if (!row) return;

      const measure = () => {
        const width = railCardWidth(row.clientWidth);
        if (width !== null) row.style.setProperty(RAIL_CARD_WIDTH_VAR, `${width}px`);
      };

      measure();
      if (typeof ResizeObserver === 'undefined') return;

      const observer = new ResizeObserver(measure);
      observer.observe(row);
      return () => observer.disconnect();
    }, []);

    return (
      <div
        ref={setRef}
        className="-mb-5 -mt-4 flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain pb-6 pr-4 pt-4 scrollbar-hide"
      >
        {children}
      </div>
    );
  },
);

ScrollRow.displayName = 'ScrollRow';
