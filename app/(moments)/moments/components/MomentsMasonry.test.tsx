import React from 'react';

import { fireEvent, render, screen } from '@testing-library/react';

import { Moment } from '@/types/moment';

import { MomentsMasonry } from './MomentsMasonry';

jest.mock('next/image', () => {
  function MockImage({ alt, src, width, height }: Record<string, unknown>) {
    return (
      <img
        alt={alt as string}
        src={src as string}
        width={width as number}
        height={height as number}
      />
    );
  }
  MockImage.displayName = 'MockImage';
  return MockImage;
});

beforeAll(() => {
  // jsdom has no IntersectionObserver
  (global as unknown as Record<string, unknown>).IntersectionObserver = class {
    observe() {}
    disconnect() {}
    unobserve() {}
  };
});

const makeMoment = (id: string, width: number, height: number): Moment =>
  ({
    id,
    title: `Moment ${id}`,
    media: [{ id: `md-${id}`, photo: `https://cdn.tukai.co/${id}.jpg`, width, height, order: 0 }],
  }) as unknown as Moment;

const defaults = {
  selectedId: null,
  onSelect: jest.fn(),
  onLoadMore: jest.fn(),
  hasMore: false,
  isLoadingMore: false,
};

describe('MomentsMasonry', () => {
  // The API supplies real dimensions; passing them is what keeps tiles at
  // their natural aspect ratio in a CSS-columns layout
  it('renders each tile at the photo intrinsic dimensions', () => {
    render(
      <MomentsMasonry
        {...defaults}
        moments={[makeMoment('a', 800, 1200), makeMoment('b', 1200, 800)]}
      />,
    );

    const tall = screen.getByAltText('Moment a');
    expect(tall).toHaveAttribute('width', '800');
    expect(tall).toHaveAttribute('height', '1200');

    const wide = screen.getByAltText('Moment b');
    expect(wide).toHaveAttribute('width', '1200');
    expect(wide).toHaveAttribute('height', '800');
  });

  it('falls back to a square when dimensions are missing', () => {
    render(<MomentsMasonry {...defaults} moments={[makeMoment('c', 0, 0)]} />);

    const image = screen.getByAltText('Moment c');
    expect(image).toHaveAttribute('width', '400');
    expect(image).toHaveAttribute('height', '400');
  });

  it('rings the selected tile only', () => {
    render(
      <MomentsMasonry
        {...defaults}
        selectedId="a"
        moments={[makeMoment('a', 800, 800), makeMoment('b', 800, 800)]}
      />,
    );

    const buttons = screen.getAllByRole('button');
    expect(buttons[0].className).toContain('ring-primary');
    expect(buttons[1].className).not.toContain('ring-primary');
  });

  it('reports the clicked moment id', () => {
    const onSelect = jest.fn();
    render(<MomentsMasonry {...defaults} onSelect={onSelect} moments={[makeMoment('a', 1, 1)]} />);

    fireEvent.click(screen.getByRole('button'));

    expect(onSelect).toHaveBeenCalledWith('a');
  });

  it('shows loading tiles while the next page is in flight', () => {
    const { container } = render(
      <MomentsMasonry {...defaults} isLoadingMore moments={[makeMoment('a', 1, 1)]} />,
    );

    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
  });
});
