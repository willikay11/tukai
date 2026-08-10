import { render, screen } from '@testing-library/react';

import { SquarePhotoStrip } from './index';

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}));

describe('SquarePhotoStrip', () => {
  it('renders nothing when there are no photos', () => {
    const { container } = render(<SquarePhotoStrip photos={[]} variant="hero" />);
    expect(container).toBeEmptyDOMElement();
  });

  // The hooks used to live inside the variant branches, below the empty-photos
  // early return, so gaining a photo changed the hook count and threw
  it('survives going from no photos to some photos (hero)', () => {
    const { rerender } = render(<SquarePhotoStrip photos={[]} variant="hero" />);

    expect(() =>
      rerender(<SquarePhotoStrip photos={['/a.jpg', '/b.jpg']} variant="hero" />),
    ).not.toThrow();

    expect(screen.getByAltText('Experience photo 1')).toBeInTheDocument();
  });

  it('survives going from no photos to some photos (strip)', () => {
    const { rerender } = render(<SquarePhotoStrip photos={[]} />);

    expect(() => rerender(<SquarePhotoStrip photos={['/a.jpg', '/b.jpg']} />)).not.toThrow();

    expect(screen.getByAltText('Experience photo 2')).toBeInTheDocument();
  });

  it('survives losing every photo again', () => {
    const { rerender, container } = render(<SquarePhotoStrip photos={['/a.jpg']} variant="hero" />);

    expect(() => rerender(<SquarePhotoStrip photos={[]} variant="hero" />)).not.toThrow();
    expect(container).toBeEmptyDOMElement();
  });

  it('survives switching variant with photos present', () => {
    const { rerender } = render(<SquarePhotoStrip photos={['/a.jpg', '/b.jpg']} variant="hero" />);

    expect(() =>
      rerender(<SquarePhotoStrip photos={['/a.jpg', '/b.jpg']} variant="strip" />),
    ).not.toThrow();
  });
});
