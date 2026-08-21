import React from 'react';

import { fireEvent, render, screen } from '@testing-library/react';

import { PhotoImage } from './PhotoImage';

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
