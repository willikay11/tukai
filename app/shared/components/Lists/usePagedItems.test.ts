import { act, renderHook } from '@testing-library/react';

import { usePagedItems } from './usePagedItems';

const items = (count: number) => Array.from({ length: count }, (_, index) => `i${index}`);

describe('usePagedItems', () => {
  it('shows the first page, and knows it is the first', () => {
    const { result } = renderHook(() => usePagedItems(items(12), 5));

    expect(result.current.items).toEqual(['i0', 'i1', 'i2', 'i3', 'i4']);
    expect(result.current.atStart).toBe(true);
    expect(result.current.atEnd).toBe(false);
    expect(result.current.pageCount).toBe(3);
  });

  it('pages forward and back', () => {
    const { result } = renderHook(() => usePagedItems(items(12), 5));

    act(() => result.current.onNext());
    expect(result.current.items).toEqual(['i5', 'i6', 'i7', 'i8', 'i9']);
    expect(result.current.atStart).toBe(false);

    act(() => result.current.onBack());
    expect(result.current.items).toEqual(['i0', 'i1', 'i2', 'i3', 'i4']);
  });

  it('stops at the last page, which may be short', () => {
    const { result } = renderHook(() => usePagedItems(items(12), 5));

    act(() => result.current.onNext());
    act(() => result.current.onNext());
    act(() => result.current.onNext());

    expect(result.current.items).toEqual(['i10', 'i11']);
    expect(result.current.atEnd).toBe(true);
  });

  it('stops at the first page going back', () => {
    const { result } = renderHook(() => usePagedItems(items(12), 5));

    act(() => result.current.onBack());

    expect(result.current.page).toBe(0);
    expect(result.current.atStart).toBe(true);
  });

  // A list with one page of its own is at both ends at once, which greys both
  // arrows — the same thing a rail with nothing to scroll reports
  it('is at both ends when everything fits on one page', () => {
    const { result } = renderHook(() => usePagedItems(items(3), 5));

    expect(result.current.atStart).toBe(true);
    expect(result.current.atEnd).toBe(true);
  });

  it('is at both ends when there is nothing at all', () => {
    const { result } = renderHook(() => usePagedItems([], 5));

    expect(result.current.items).toEqual([]);
    expect(result.current.atStart).toBe(true);
    expect(result.current.atEnd).toBe(true);
  });

  // Results landing, or a filter narrowing the list, must not throw a reader
  // sitting on page three back to page one
  it('clamps to the last page when the list shrinks', () => {
    const { result, rerender } = renderHook(({ list }) => usePagedItems(list, 5), {
      initialProps: { list: items(12) },
    });

    act(() => result.current.onNext());
    act(() => result.current.onNext());
    expect(result.current.page).toBe(2);

    rerender({ list: items(7) });

    expect(result.current.page).toBe(1);
    expect(result.current.items).toEqual(['i5', 'i6']);
  });
});
