import React from 'react';

import { createEvent, fireEvent, render, screen } from '@testing-library/react';

import { PhotoImage } from './PhotoImage';

// jsdom has no AnimationEvent, so the name is set on the event by hand
const endAnimation = (element: Element, animationName: string) => {
  const event = createEvent.animationEnd(element);
  Object.defineProperty(event, 'animationName', { value: animationName });
  fireEvent(element, event);
};

jest.mock('next/image', () => {
  function MockImage({ alt, src, onError, fill: _fill, ...rest }: Record<string, unknown>) {
    return (
      <img
        alt={alt as string}
        src={src as string}
        onError={onError as React.ReactEventHandler<HTMLImageElement>}
        {...(rest as Record<string, unknown>)}
      />
    );
  }
  MockImage.displayName = 'MockImage';
  return MockImage;
});

const FALLBACK = 'ImageNotFound01Icon';

describe('PhotoImage', () => {
  it('renders the photo while it loads fine', () => {
    render(<PhotoImage src="https://cdn.tukai.co/a.jpg" alt="A hike" fill />);

    expect(screen.getByRole('img', { name: 'A hike' })).toHaveAttribute(
      'src',
      'https://cdn.tukai.co/a.jpg',
    );
    expect(screen.queryByTestId(FALLBACK)).not.toBeInTheDocument();
  });

  it('swaps to the fallback when the photo fails to load', async () => {
    render(<PhotoImage src="https://cdn.tukai.co/gone.jpg" alt="A hike" fill />);

    fireEvent.error(screen.getByRole('img', { name: 'A hike' }));

    expect(await screen.findByTestId(FALLBACK)).toBeInTheDocument();
    expect(screen.queryByRole('img', { name: 'A hike' })).not.toBeInTheDocument();
  });

  // next/image throws on a null src, so a missing photo never reaches it
  it.each([
    ['null', null],
    ['undefined', undefined],
    ['an empty string', ''],
  ])('shows the fallback when src is %s', async (_label, src) => {
    render(<PhotoImage src={src} alt="A hike" fill />);

    expect(await screen.findByTestId(FALLBACK)).toBeInTheDocument();
  });

  it('still tells the caller about the error', () => {
    const onError = jest.fn();
    render(<PhotoImage src="https://cdn.tukai.co/gone.jpg" alt="A hike" fill onError={onError} />);

    fireEvent.error(screen.getByRole('img', { name: 'A hike' }));

    expect(onError).toHaveBeenCalledTimes(1);
  });

  // A masonry column is sized by its tiles, so a fallback with no height would
  // pull the layout in around it.
  // ⚠️ The ratio itself rides on an inline `aspect-ratio`, which jsdom does not
  // implement and drops on render - only the sizing classes are assertable here.
  it('holds the photo shape open when it is sized by its own dimensions', () => {
    const { container } = render(<PhotoImage src="" alt="A hike" width={400} height={300} />);

    expect(container.firstChild).toHaveClass('h-auto', 'w-full');
  });

  it('leaves a fill image to be sized by its parent', () => {
    const { container } = render(<PhotoImage src="" alt="A hike" fill />);

    expect(container.firstChild).not.toHaveClass('h-auto');
  });

  it('takes a caller label and shape for the fallback', () => {
    const { container } = render(
      <PhotoImage
        src=""
        alt="A hike"
        fill
        fallbackLabel="Image not available"
        fallbackClassName="rounded-full"
      />,
    );

    expect(screen.getByText('Image not available')).toBeInTheDocument();
    expect(container.firstChild).toHaveClass('rounded-full');
  });
});

describe('PhotoImage with an unusable src', () => {
  /**
   * next/image throws during render on a bare storage key rather than firing
   * onError, so the whole page goes down with it. The API hands these back for
   * some bookmark photos.
   */
  it.each(['experiences/photos/abc.jpg', 'abc.jpg'])('falls back on %s', (src) => {
    render(<PhotoImage src={src} alt="Saved" fill fallbackLabel="No photo" />);

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it.each(['https://cdn.test/a.jpg', '/images/local.webp', 'data:image/png;base64,AAAA'])(
    'still renders %s',
    (src) => {
      render(<PhotoImage src={src} alt="Saved" fill />);

      expect(screen.getByRole('img')).toBeInTheDocument();
    },
  );
});

/**
 * The pulse and fade themselves are CSS keyed on `data-fx` (globals.css), which
 * jsdom does not run - what is checked here is that the state reaches the
 * element and moves the way the handoff describes. jsdom never fetches, so
 * every image starts out not `complete`.
 */
describe('the loading animation', () => {
  const img = () => screen.getByRole('img', { name: 'A hike' });

  it('pulses while the photo loads, then fades it in', () => {
    render(<PhotoImage src="https://cdn.tukai.co/a.jpg" alt="A hike" fill />);

    expect(img()).toHaveAttribute('data-fx', 'wait');

    fireEvent.load(img());
    expect(img()).toHaveAttribute('data-fx', 'in');

    endAnimation(img(), 'tkImgIn');
    expect(img()).toHaveAttribute('data-fx', 'done');
  });

  // The old blur placeholder painted a background over the image box, which
  // would hide the pulse
  it('no longer asks next/image for a blur placeholder', () => {
    render(<PhotoImage src="https://cdn.tukai.co/a.jpg" alt="A hike" fill />);

    expect(img()).not.toHaveAttribute('placeholder');
  });

  // A local upload preview should appear the instant it is picked
  it('leaves a data: preview alone', () => {
    render(<PhotoImage src="data:image/png;base64,AAAA" alt="A hike" fill />);

    expect(img()).toHaveAttribute('data-fx', 'off');
  });

  it('still tells the caller the photo loaded', () => {
    const onLoad = jest.fn();
    render(<PhotoImage src="https://cdn.tukai.co/a.jpg" alt="A hike" fill onLoad={onLoad} />);

    fireEvent.load(img());

    expect(onLoad).toHaveBeenCalledTimes(1);
  });
});
