import React from 'react';

import { act, render } from '@testing-library/react';

import { AlbumCrossfade } from './AlbumCrossfade';

jest.mock('@/app/shared/components/Images', () => ({
  PhotoImage: ({ src, className }: { src: string; className: string }) => (
    <img alt="" src={src} className={className} />
  ),
}));

const photos = ['https://cdn.tukai.co/a.jpg', 'https://cdn.tukai.co/b.jpg', 'https://cdn.tukai.co/c.jpg'];

const currentDot = (container: HTMLElement) =>
  Array.from(container.querySelectorAll('[aria-hidden="true"] > span')).findIndex((dot) =>
    dot.hasAttribute('data-current'),
  );

describe('AlbumCrossfade', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('shows the first photo and a dot per photo at rest', () => {
    const { container } = render(<AlbumCrossfade photos={photos} isPlaying={false} sizes="300px" />);

    expect(container.querySelectorAll('img')).toHaveLength(1);
    expect(container.querySelectorAll('[aria-hidden="true"] > span')).toHaveLength(3);
    expect(currentDot(container)).toBe(0);
  });

  it('plays through the photos while playing, looping', () => {
    const { container, rerender } = render(
      <AlbumCrossfade photos={photos} isPlaying={false} sizes="300px" />,
    );
    rerender(<AlbumCrossfade photos={photos} isPlaying sizes="300px" />);

    expect(container.querySelectorAll('img')).toHaveLength(3);

    act(() => jest.advanceTimersByTime(300));
    expect(currentDot(container)).toBe(1);

    act(() => jest.advanceTimersByTime(1300));
    expect(currentDot(container)).toBe(2);

    act(() => jest.advanceTimersByTime(1300));
    expect(currentDot(container)).toBe(0);
  });

  it('goes back to the first photo when it stops', () => {
    const { container, rerender } = render(
      <AlbumCrossfade photos={photos} isPlaying sizes="300px" />,
    );
    act(() => jest.advanceTimersByTime(300));

    rerender(<AlbumCrossfade photos={photos} isPlaying={false} sizes="300px" />);
    act(() => jest.advanceTimersByTime(5000));

    expect(currentDot(container)).toBe(0);
  });

  it('stays on the first photo with reduced motion', () => {
    const matchMedia = window.matchMedia;
    window.matchMedia = jest.fn().mockReturnValue({ matches: true }) as never;

    const { container } = render(<AlbumCrossfade photos={photos} isPlaying sizes="300px" />);
    act(() => jest.advanceTimersByTime(5000));

    expect(currentDot(container)).toBe(0);
    window.matchMedia = matchMedia;
  });
});
