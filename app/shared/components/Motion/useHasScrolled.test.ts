import { act, renderHook } from '@testing-library/react';

import { useHasScrolled } from './useHasScrolled';

const scrollTo = (y: number) => {
  window.scrollY = y;
  act(() => window.dispatchEvent(new Event('scroll')));
};

describe('useHasScrolled', () => {
  afterEach(() => {
    window.scrollY = 0;
  });

  it('is false at the top of the page', () => {
    const { result } = renderHook(() => useHasScrolled(200));

    expect(result.current).toBe(false);
  });

  it('turns true once past the threshold, and back at the top', () => {
    const { result } = renderHook(() => useHasScrolled(200));

    scrollTo(201);
    expect(result.current).toBe(true);

    scrollTo(0);
    expect(result.current).toBe(false);
  });

  // A page restored mid-scroll must not report the top
  it('reads the position on mount rather than waiting for a scroll', () => {
    window.scrollY = 500;

    const { result } = renderHook(() => useHasScrolled(200));

    expect(result.current).toBe(true);
  });

  it('stays false while disabled', () => {
    const { result } = renderHook(() => useHasScrolled(200, false));

    scrollTo(500);
    expect(result.current).toBe(false);
  });
});
