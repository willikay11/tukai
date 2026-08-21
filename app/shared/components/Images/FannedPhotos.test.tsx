import React from 'react';

import { render } from '@testing-library/react';

import { FannedPhotos } from './FannedPhotos';

jest.mock('next/image', () => {
  function MockImage({ alt, src }: Record<string, unknown>) {
    return <img alt={alt as string} src={src as string} />;
  }
  MockImage.displayName = 'MockImage';
  return MockImage;
});

const sourcesIn = (container: HTMLElement) =>
  Array.from(container.querySelectorAll('img')).map((image) => image.getAttribute('src'));

describe('FannedPhotos', () => {
  it('centres the first photo and fans the next two behind it', () => {
    const { container } = render(<FannedPhotos photos={['a.jpg', 'b.jpg', 'c.jpg']} />);

    expect(container.querySelector('.z-10 img')).toHaveAttribute('src', 'a.jpg');
    expect(container.querySelector('.-rotate-12 img')).toHaveAttribute('src', 'b.jpg');
    expect(container.querySelector('.rotate-12:not(.-rotate-12) img')).toHaveAttribute(
      'src',
      'c.jpg',
    );
  });

  // Two photos lean left rather than leaving a gap on one side
  it('fills the left side first when there are only two', () => {
    const { container } = render(<FannedPhotos photos={['a.jpg', 'b.jpg']} />);

    expect(sourcesIn(container)).toHaveLength(2);
    expect(container.querySelector('.z-10 img')).toHaveAttribute('src', 'a.jpg');
    expect(container.querySelector('.-rotate-12 img')).toHaveAttribute('src', 'b.jpg');
    expect(container.querySelector('.rotate-12:not(.-rotate-12)')).not.toBeInTheDocument();
  });

  it('renders a single photo on its own, with no fan', () => {
    const { container } = render(<FannedPhotos photos={['a.jpg']} />);

    expect(sourcesIn(container)).toEqual(['a.jpg']);
    expect(container.querySelector('.-rotate-12')).not.toBeInTheDocument();
  });

  it('ignores photos beyond the third', () => {
    const { container } = render(
      <FannedPhotos photos={['a.jpg', 'b.jpg', 'c.jpg', 'd.jpg', 'e.jpg']} />,
    );

    expect(sourcesIn(container)).toHaveLength(3);
  });

  // Rows hand over items whose photo may be missing; those must not render as
  // broken tiles or take up a slot in the fan
  it('skips missing photos rather than rendering empty tiles', () => {
    const { container } = render(<FannedPhotos photos={[null, 'b.jpg', undefined, '', 'c.jpg']} />);

    expect(sourcesIn(container)).toEqual(expect.arrayContaining(['b.jpg', 'c.jpg']));
    expect(sourcesIn(container)).toHaveLength(2);
    expect(container.querySelector('.z-10 img')).toHaveAttribute('src', 'b.jpg');
  });

  it('renders nothing when there are no photos', () => {
    const { container } = render(<FannedPhotos photos={[null, '', undefined]} />);

    expect(container).toBeEmptyDOMElement();
  });

  // The photos are decorative — every caller wraps them in its own labelled
  // link or card
  it('marks the photos as decorative', () => {
    const { container } = render(<FannedPhotos photos={['a.jpg', 'b.jpg']} />);

    container.querySelectorAll('img').forEach((image) => {
      expect(image).toHaveAttribute('alt', '');
    });
  });

  it('scales the fan down for the small size', () => {
    const { container } = render(<FannedPhotos photos={['a.jpg']} size="sm" />);

    expect(container.querySelector('.z-10')).toHaveClass('h-9', 'w-9');
  });

  it('defaults to the large size', () => {
    const { container } = render(<FannedPhotos photos={['a.jpg']} />);

    expect(container.querySelector('.z-10')).toHaveClass('h-20', 'w-20');
  });
});
