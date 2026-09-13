import React from 'react';

import { fireEvent, render, screen } from '@testing-library/react';

import { PHOTO_PLACEHOLDER_BLUR, PhotoImage } from './PhotoImage';

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

  it('swaps to the fallback when the photo fails to load', () => {
    render(<PhotoImage src="https://cdn.tukai.co/gone.jpg" alt="A hike" fill />);

    fireEvent.error(screen.getByRole('img', { name: 'A hike' }));

    expect(screen.getByTestId(FALLBACK)).toBeInTheDocument();
    expect(screen.queryByRole('img', { name: 'A hike' })).not.toBeInTheDocument();
  });

  // next/image throws on a null src, so a missing photo never reaches it
  it.each([
    ['null', null],
    ['undefined', undefined],
    ['an empty string', ''],
  ])('shows the fallback when src is %s', (_label, src) => {
    render(<PhotoImage src={src} alt="A hike" fill />);

    expect(screen.getByTestId(FALLBACK)).toBeInTheDocument();
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
  // implement and drops on render — only the sizing classes are assertable here.
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
 * The blur is what a photo looks like before it arrives. jsdom renders none of
 * it — `next/image` turns these props into a CSS background it strips on load
 * — so what is checked here is that the right props reach it, and that the
 * surfaces where a blur would be a flicker rather than a fade opt out.
 */
describe('the placeholder blur', () => {
  const img = () => screen.getByRole('img', { name: 'A hike' });

  it('blurs a photo that fills its parent', () => {
    render(<PhotoImage src="https://cdn.tukai.co/a.jpg" alt="A hike" fill />);

    expect(img()).toHaveAttribute('placeholder', 'blur');
    expect(img()).toHaveAttribute('blurdataurl', PHOTO_PLACEHOLDER_BLUR);
  });

  it('blurs a photo big enough to be worth it', () => {
    render(<PhotoImage src="https://cdn.tukai.co/a.jpg" alt="A hike" width={400} height={300} />);

    expect(img()).toHaveAttribute('placeholder', 'blur');
  });

  // next/image warns below 40x40, and an avatar resolving from a grey smudge
  // reads as a glitch
  it('leaves something avatar-sized alone', () => {
    render(<PhotoImage src="https://cdn.tukai.co/a.jpg" alt="A hike" width={32} height={32} />);

    expect(img()).not.toHaveAttribute('placeholder');
  });

  // The real blur-up, once the API generates thumbnails for more than a
  // handful of photos
  it('prefers a blur the caller supplies', () => {
    render(
      <PhotoImage
        src="https://cdn.tukai.co/a.jpg"
        alt="A hike"
        fill
        blurDataURL="data:image/png;base64,ZZZ"
      />,
    );

    expect(img()).toHaveAttribute('blurdataurl', 'data:image/png;base64,ZZZ');
  });

  it('does not argue with a caller that asked for no placeholder', () => {
    render(<PhotoImage src="https://cdn.tukai.co/a.jpg" alt="A hike" fill placeholder="empty" />);

    expect(img()).toHaveAttribute('placeholder', 'empty');
  });

  it('never reaches the fallback path', () => {
    render(<PhotoImage src={null} alt="A hike" fill />);

    expect(screen.getByTestId(FALLBACK)).toBeInTheDocument();
  });
});
