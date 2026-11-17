import React from 'react';

import { act, fireEvent, render } from '@testing-library/react';

import { StopCrossfade } from './StopCrossfade';

jest.mock('@/app/shared/components/Images', () => ({
  PhotoImage: ({ src, alt, className }: { src: string; alt: string; className: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} src={src} className={className} />
  ),
}));

const photos = [
  'https://cdn.tukai.co/stop-1.jpg',
  'https://cdn.tukai.co/stop-2.jpg',
  'https://cdn.tukai.co/stop-3.jpg',
  'https://cdn.tukai.co/stop-4.jpg',
];

/** The topmost photo showing: the one a reader sees. */
const onScreen = (container: HTMLElement): number => {
  const images = Array.from(container.querySelectorAll('img'));
  const top = images.findIndex((image) => image.className.includes('z-[2]'));
  return top === -1 ? 0 : top;
};

// jsdom has no PointerEvent, and drops `pointerType` without one
class PointerEventStandIn extends MouseEvent {
  pointerType: string;
  constructor(type: string, init: PointerEventInit = {}) {
    super(type, init);
    this.pointerType = init.pointerType ?? '';
  }
}
(window as unknown as { PointerEvent: unknown }).PointerEvent ??= PointerEventStandIn;

let reveal: (() => void) | null = null;
let reducedMotion = false;

beforeEach(() => {
  jest.useFakeTimers();
  reveal = null;
  reducedMotion = false;

  // A stand-in that only reports in view when the test says so
  (global as unknown as { IntersectionObserver: unknown }).IntersectionObserver = jest.fn(
    (callback: (entries: { isIntersecting: boolean }[]) => void) => {
      reveal = () => callback([{ isIntersecting: true }]);
      return { observe: jest.fn(), disconnect: jest.fn() };
    },
  );
  window.matchMedia = jest.fn().mockImplementation(() => ({ matches: reducedMotion }));
});

afterEach(() => jest.useRealTimers());

const hover = (container: HTMLElement) =>
  fireEvent.pointerEnter(container.firstChild as Element, { pointerType: 'mouse' });

describe('StopCrossfade', () => {
  it('mounts every photo with the card, the first one named and the rest hidden', () => {
    const { container } = render(<StopCrossfade photos={photos} alt="Nairobi" sizes="184px" />);

    const images = container.querySelectorAll('img');
    expect(images).toHaveLength(4);
    expect(images[0]).toHaveAttribute('alt', 'Nairobi');
    expect(images[1]).toHaveAttribute('alt', '');
    expect(onScreen(container)).toBe(0);
  });

  it('plays through once on first view, 2.2s a step, after 1.2s and its offset', () => {
    const { container } = render(
      <StopCrossfade photos={photos} alt="" offsetMs={700} sizes="184px" />,
    );

    act(() => reveal?.());
    act(() => jest.advanceTimersByTime(1899));
    expect(onScreen(container)).toBe(0);

    act(() => jest.advanceTimersByTime(1));
    expect(onScreen(container)).toBe(1);

    act(() => jest.advanceTimersByTime(2200));
    expect(onScreen(container)).toBe(2);

    act(() => jest.advanceTimersByTime(2200));
    expect(onScreen(container)).toBe(3);

    // Back to the first stop, and stops there
    act(() => jest.advanceTimersByTime(2200));
    expect(onScreen(container)).toBe(0);
    act(() => jest.advanceTimersByTime(20000));
    expect(onScreen(container)).toBe(0);
  });

  it('plays again on hover, 250ms in', () => {
    const { container } = render(<StopCrossfade photos={photos} alt="" sizes="184px" />);

    hover(container);
    act(() => jest.advanceTimersByTime(249));
    expect(onScreen(container)).toBe(0);
    act(() => jest.advanceTimersByTime(1));
    expect(onScreen(container)).toBe(1);
  });

  it('lets a play-through already running finish rather than restarting it', () => {
    const { container } = render(<StopCrossfade photos={photos} alt="" sizes="184px" />);

    hover(container);
    act(() => jest.advanceTimersByTime(250 + 2200));
    expect(onScreen(container)).toBe(2);

    hover(container);
    act(() => jest.advanceTimersByTime(2200));
    expect(onScreen(container)).toBe(3);
  });

  it('ignores a touch, which only plays on first view', () => {
    const { container } = render(<StopCrossfade photos={photos} alt="" sizes="184px" />);

    fireEvent.pointerEnter(container.firstChild as Element, { pointerType: 'touch' });
    act(() => jest.advanceTimersByTime(5000));
    expect(onScreen(container)).toBe(0);
  });

  it('never plays with reduced motion', () => {
    reducedMotion = true;
    const { container } = render(<StopCrossfade photos={photos} alt="" sizes="184px" />);

    act(() => reveal?.());
    hover(container);
    act(() => jest.advanceTimersByTime(20000));
    expect(onScreen(container)).toBe(0);
  });

  it('has nothing to play with a single photo', () => {
    const { container } = render(
      <StopCrossfade photos={photos.slice(0, 1)} alt="" sizes="184px" />,
    );

    hover(container);
    act(() => jest.advanceTimersByTime(5000));
    expect(container.querySelectorAll('img')).toHaveLength(1);
  });
});
