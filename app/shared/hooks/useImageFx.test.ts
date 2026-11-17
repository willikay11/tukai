import { renderHook } from '@testing-library/react';

import { useImageFx } from './useImageFx';

describe('useImageFx', () => {
  /**
   * next/image rebuilds its ref callback whenever `onError` changes, and that
   * re-runs this hook's ref, which sets state - so handlers that changed every
   * render looped until React gave up ("Maximum update depth exceeded").
   */
  it('hands back the same handlers and ref across renders', () => {
    const { result, rerender } = renderHook(
      ({ onError }) => useImageFx('https://cdn.tukai.co/a.jpg', { onError }),
      { initialProps: { onError: jest.fn() } },
    );
    const first = result.current;

    rerender({ onError: jest.fn() });

    expect(result.current.ref).toBe(first.ref);
    expect(result.current.onLoad).toBe(first.onLoad);
    expect(result.current.onError).toBe(first.onError);
    expect(result.current.onAnimationEnd).toBe(first.onAnimationEnd);
  });

  it('still calls the latest handler the caller passed', () => {
    const stale = jest.fn();
    const latest = jest.fn();
    const { result, rerender } = renderHook(
      ({ onError }) => useImageFx('https://cdn.tukai.co/a.jpg', { onError }),
      { initialProps: { onError: stale } },
    );

    rerender({ onError: latest });
    result.current.onError({} as never);

    expect(stale).not.toHaveBeenCalled();
    expect(latest).toHaveBeenCalledTimes(1);
  });
});
