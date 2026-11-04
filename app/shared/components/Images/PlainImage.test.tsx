import React from 'react';

import { createEvent, fireEvent, render, screen } from '@testing-library/react';

import { PlainImage } from './PlainImage';

// jsdom has no AnimationEvent, so the name is set on the event by hand
const endAnimation = (element: Element, animationName: string) => {
  const event = createEvent.animationEnd(element);
  Object.defineProperty(event, 'animationName', { value: animationName });
  fireEvent(element, event);
};

/**
 * The animation is CSS keyed on `data-fx`; these follow the state machine from
 * the design handoff. jsdom never fetches, so an image is not `complete` unless
 * a test says so.
 */
describe('PlainImage', () => {
  const img = () => screen.getByRole('img', { name: 'A hike' });

  it('pulses, fades in, then settles', () => {
    render(<PlainImage src="https://cdn.tukai.co/a.jpg" alt="A hike" />);

    expect(img()).toHaveAttribute('data-fx', 'wait');

    fireEvent.load(img());
    expect(img()).toHaveAttribute('data-fx', 'in');

    endAnimation(img(), 'tkImgIn');
    expect(img()).toHaveAttribute('data-fx', 'done');
  });

  // Some other animation on the element ending says nothing about the fade
  it('only settles when the fade itself ends', () => {
    render(<PlainImage src="https://cdn.tukai.co/a.jpg" alt="A hike" />);

    fireEvent.load(img());
    endAnimation(img(), 'somethingElse');

    expect(img()).toHaveAttribute('data-fx', 'in');
  });

  it('stops pulsing when the photo fails', () => {
    render(<PlainImage src="https://cdn.tukai.co/gone.jpg" alt="A hike" />);

    fireEvent.error(img());

    expect(img()).toHaveAttribute('data-fx', 'done');
  });

  describe('a photo the browser already has', () => {
    const complete = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'complete');

    beforeEach(() => {
      Object.defineProperty(HTMLImageElement.prototype, 'complete', {
        configurable: true,
        get: () => true,
      });
    });

    afterEach(() => {
      if (complete) Object.defineProperty(HTMLImageElement.prototype, 'complete', complete);
    });

    it('shows at once, with no animation', () => {
      render(<PlainImage src="https://cdn.tukai.co/a.jpg" alt="A hike" />);

      expect(img()).toHaveAttribute('data-fx', 'done');

      // A late load event - next/image sends one for cached images - must not
      // replay the fade on a photo already showing
      fireEvent.load(img());
      expect(img()).toHaveAttribute('data-fx', 'done');
    });
  });

  it('starts over when the photo changes', () => {
    const { rerender } = render(<PlainImage src="https://cdn.tukai.co/a.jpg" alt="A hike" />);
    fireEvent.load(img());
    endAnimation(img(), 'tkImgIn');

    rerender(<PlainImage src="https://cdn.tukai.co/b.jpg" alt="A hike" />);

    expect(img()).toHaveAttribute('data-fx', 'wait');
  });

  it.each([
    ['a data: preview', 'data:image/png;base64,AAAA'],
    ['a blob: preview', 'blob:https://tukai.co/1234'],
    ['an SVG', '/images/logo.svg'],
    ['an SVG with a query', '/images/logo.svg?v=2'],
  ])('never animates %s', (_label, src) => {
    render(<PlainImage src={src} alt="A hike" />);

    expect(img()).toHaveAttribute('data-fx', 'off');

    fireEvent.error(img());
    expect(img()).toHaveAttribute('data-fx', 'off');
  });

  // A filter or transform of its own would be replaced by the fade's blur and
  // scale for 2s - a grayscale photo would flash colour, a tilted one swing in
  it.each([
    ['filter', { filter: 'grayscale(1)' }],
    ['transform', { transform: 'rotate(14deg)' }],
  ])('fades an image with its own %s by opacity only', (_label, style) => {
    render(<PlainImage src="https://cdn.tukai.co/a.jpg" alt="A hike" style={style} />);

    expect(img()).toHaveAttribute('data-fx-fade-only');
  });

  it('gives a plain image the full fade', () => {
    render(<PlainImage src="https://cdn.tukai.co/a.jpg" alt="A hike" />);

    expect(img()).not.toHaveAttribute('data-fx-fade-only');
  });

  it('still runs the caller handlers', () => {
    const onLoad = jest.fn();
    const onError = jest.fn();
    const onAnimationEnd = jest.fn();
    render(
      <PlainImage
        src="https://cdn.tukai.co/a.jpg"
        alt="A hike"
        onLoad={onLoad}
        onError={onError}
        onAnimationEnd={onAnimationEnd}
      />,
    );

    fireEvent.load(img());
    endAnimation(img(), 'tkImgIn');
    fireEvent.error(img());

    expect(onLoad).toHaveBeenCalledTimes(1);
    expect(onAnimationEnd).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledTimes(1);
  });
});
