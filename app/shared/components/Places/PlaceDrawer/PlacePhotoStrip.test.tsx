import React from 'react';

import { fireEvent, render, screen } from '@testing-library/react';

import { PlacePhotoStrip } from './PlacePhotoStrip';

jest.mock('@/app/shared/components/Icons', () => ({
  IconComponent: ({ iconName }: { iconName: string }) => <span data-testid={iconName} />,
}));
jest.mock('@/app/shared/components/Images', () => ({
  PhotoImage: ({ alt, src, className }: { alt: string; src: string; className: string }) => (
    <img alt={alt} src={src} className={className} />
  ),
}));

/**
 * jsdom lays nothing out, so everything reports a scrollWidth and clientWidth
 * of 0 - which the rail reads as "nothing to scroll". Overflow is simulated by
 * giving the row a width smaller than its contents.
 */
const withOverflow = () => {
  Object.defineProperty(HTMLElement.prototype, 'scrollWidth', {
    configurable: true,
    get: () => 1200,
  });
  Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
    configurable: true,
    get: () => 480,
  });
  HTMLElement.prototype.scrollBy = jest.fn();
};

const resetGeometry = () => {
  Object.defineProperty(HTMLElement.prototype, 'scrollWidth', { configurable: true, get: () => 0 });
  Object.defineProperty(HTMLElement.prototype, 'clientWidth', { configurable: true, get: () => 0 });
};

const photos = ['https://cdn.tukai.co/a.jpg', 'https://cdn.tukai.co/b.jpg'];

describe('PlacePhotoStrip', () => {
  afterEach(resetGeometry);

  it('renders every photo, named for the place', () => {
    render(<PlacePhotoStrip photos={photos} alt="Kazuri Beads Workshop" />);

    expect(screen.getByAltText('Kazuri Beads Workshop photo 1')).toHaveAttribute('src', photos[0]);
    expect(screen.getByAltText('Kazuri Beads Workshop photo 2')).toBeInTheDocument();
  });

  // A wide room and a tall doorway both read as themselves
  it('sets one height and lets each photo keep its width', () => {
    render(<PlacePhotoStrip photos={photos} alt="Kazuri" />);

    expect(screen.getByAltText('Kazuri photo 1')).toHaveClass('h-[240px]', 'w-auto');
  });

  it('renders nothing when the place has no photos', () => {
    const { container } = render(<PlacePhotoStrip photos={[]} alt="Kazuri" />);

    expect(container).toBeEmptyDOMElement();
  });

  describe('the arrows', () => {
    it('offers none when every photo already fits', () => {
      resetGeometry();

      render(<PlacePhotoStrip photos={photos} alt="Kazuri" />);

      expect(screen.queryByRole('button', { name: /more photos/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /previous photos/i })).not.toBeInTheDocument();
    });

    it('offers the next one once the row overflows', () => {
      withOverflow();

      render(<PlacePhotoStrip photos={photos} alt="Kazuri" />);

      const next = screen.getByRole('button', { name: /more photos/i });
      expect(next).toBeInTheDocument();
      // At the start, so there is nothing to go back to
      expect(screen.queryByRole('button', { name: /previous photos/i })).not.toBeInTheDocument();

      fireEvent.click(next);
      expect(HTMLElement.prototype.scrollBy).toHaveBeenCalled();
    });
  });
});
