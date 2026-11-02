'use client';

import { useState } from 'react';

/**
 * "Show N more" over a list, remembered independently wherever it is called -
 * each section of the Communities page keeps its own expanded state rather
 * than sharing one flag, so opening one section's "Show more" never expands
 * another's.
 */
export const useShowMore = <T,>(items: T[], initialCount: number) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const visible = isExpanded ? items : items.slice(0, initialCount);
  const hasMore = items.length > initialCount;

  return {
    visible,
    isExpanded,
    hasMore,
    toggle: () => setIsExpanded((previous) => !previous),
    collapse: () => setIsExpanded(false),
  };
};
