'use client';

import { useEffect, useState } from 'react';

/** Tracks in a grid's resolved `grid-template-columns`, or 0 before layout. */
const countColumns = (element: HTMLElement): number =>
  getComputedStyle(element).gridTemplateColumns.split(' ').filter(Boolean).length;

/**
 * How many columns an auto-fill grid has settled on.
 *
 * The browser decides that from the width, so it is read back off the grid
 * rather than worked out from breakpoints, and read again whenever the grid
 * resizes. Pass the returned ref to the grid; `fallback` stands until the
 * first measurement - and in a test, where nothing is laid out.
 */
export const useGridColumns = (fallback: number) => {
  const [element, setElement] = useState<HTMLElement | null>(null);
  const [columns, setColumns] = useState(fallback);

  useEffect(() => {
    if (!element) return;

    const measure = () => {
      const count = countColumns(element);
      if (count > 0) setColumns(count);
    };
    measure();

    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure);
    observer?.observe(element);

    return () => observer?.disconnect();
  }, [element]);

  return { ref: setElement, columns };
};
