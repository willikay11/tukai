'use client';

import { useCallback, useMemo, useState } from 'react';

/**
 * Paging a grid a page at a time, from the arrows in its section header.
 *
 * A grid cannot be paged the way {@link useRailPaging} pages a rail: nothing
 * scrolls, so there is no position to read. The page is counted instead, and
 * the slice is what gets rendered.
 *
 * The page is clamped rather than reset when the list shrinks, so a reader
 * sitting on the last page when results land does not get thrown back to the
 * first.
 */
export const usePagedItems = <T>(items: T[], pageSize: number) => {
  const [requested, setRequested] = useState(0);

  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  const page = Math.min(requested, pageCount - 1);

  const visible = useMemo(
    () => items.slice(page * pageSize, page * pageSize + pageSize),
    [items, page, pageSize],
  );

  const step = useCallback(
    (direction: 1 | -1) =>
      setRequested((current) => Math.min(Math.max(current + direction, 0), pageCount - 1)),
    [pageCount],
  );

  return {
    items: visible,
    page,
    pageCount,
    atStart: page === 0,
    atEnd: page >= pageCount - 1,
    onBack: useCallback(() => step(-1), [step]),
    onNext: useCallback(() => step(1), [step]),
  };
};
