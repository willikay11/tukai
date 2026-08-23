'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Tracks which of several in-page sections the reader is currently looking at,
 * so an anchor tab row can highlight it.
 *
 * The section nearest the top of the viewport wins, rather than whichever
 * intersects most: with sections of very different heights, "most visible"
 * flips to a tall section while its heading is still far below the fold.
 *
 * @param sectionIds  element ids to watch, in page order
 * @param offset      distance from the top a section must clear to count as
 *                    current — match the sticky header it scrolls under
 */
export const useScrollSpy = (sectionIds: string[], offset = 96) => {
  const [activeId, setActiveId] = useState<string>(sectionIds[0] ?? '');
  // A tab the reader picked, held active until the smooth scroll actually
  // arrives. Without this the scroll events fired on the way there recompute
  // the active section from wherever the page currently is, and the pill snaps
  // back to whatever the reader was reading before they clicked.
  const pendingId = useRef<string | null>(null);
  const pendingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (sectionIds.length === 0) return;

    const pickActive = () => {
      const positions = sectionIds
        .map((id) => {
          const element = document.getElementById(id);
          if (!element) return null;
          return { id, top: element.getBoundingClientRect().top - offset };
        })
        .filter((entry): entry is { id: string; top: number } => entry !== null);

      if (positions.length === 0) return;

      // The last section whose top has passed the offset line; before any has,
      // the first section is current
      const passed = positions.filter((entry) => entry.top <= 0);
      const current = passed.length ? passed[passed.length - 1] : positions[0];

      // At the very bottom the last section may be too short to reach the
      // line — without this its tab could never light up. Guarded on the page
      // actually being scrollable, or a short page that fits the viewport would
      // always report its last section as current.
      const isScrollable = document.body.scrollHeight > window.innerHeight + 1;
      const atBottom =
        isScrollable && window.innerHeight + window.scrollY >= document.body.scrollHeight - 2;

      const next = atBottom ? positions[positions.length - 1].id : current.id;

      if (pendingId.current) {
        // Only release the hold once the scroll has landed on the target
        if (next !== pendingId.current) return;
        pendingId.current = null;
      }

      setActiveId(next);
    };

    pickActive();
    window.addEventListener('scroll', pickActive, { passive: true });
    window.addEventListener('resize', pickActive);

    return () => {
      window.removeEventListener('scroll', pickActive);
      window.removeEventListener('resize', pickActive);
    };
  }, [sectionIds, offset]);

  const scrollTo = useCallback((id: string) => {
    const element = document.getElementById(id);
    if (!element) return;

    pendingId.current = id;
    setActiveId(id);

    // A section too short to reach the offset line — the last one, usually —
    // would hold the pill forever, so the hold also times out
    if (pendingTimer.current) clearTimeout(pendingTimer.current);
    pendingTimer.current = setTimeout(() => {
      pendingId.current = null;
    }, 1200);

    // `scroll-mt-*` on the section supplies the sticky-header offset
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  useEffect(
    () => () => {
      if (pendingTimer.current) clearTimeout(pendingTimer.current);
    },
    [],
  );

  return { activeId, scrollTo };
};
