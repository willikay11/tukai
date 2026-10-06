import React from 'react';

import { fireEvent, render, screen } from '@testing-library/react';

import { Moment } from '@/types/moment';

import { MomentsMasonry } from './MomentsMasonry';

jest.mock('next-auth/react', () => ({ useSession: () => ({ data: null }) }));

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

  // Regression: a moment whose media is a video (photo: null) reached
  // next/image, which threw "Cannot read properties of null (reading 'default')"
  // and took the whole page down with a client-side exception
  it('skips media whose photo cannot be rendered', () => {
    const withVideo = {
      id: 'v',
      title: 'Video moment',
      media: [{ id: 'md-v', photo: null, width: 800, height: 600, order: 0 }],
    } as unknown as Moment;

    render(<MomentsMasonry {...defaults} moments={[withVideo, makeMoment('a', 800, 600)]} />);

    expect(screen.queryByAltText('Video moment')).not.toBeInTheDocument();
    expect(screen.getByAltText('Moment a')).toBeInTheDocument();
  });

  it('prefers the first renderable photo over an unrenderable one', () => {
    const mixed = {
      id: 'x',
      title: 'Mixed',
      media: [
        { id: 'a', photo: null, width: 1, height: 1, order: 0 },
        { id: 'b', photo: 'https://cdn.tukai.co/real.jpg', width: 800, height: 600, order: 1 },
      ],
    } as unknown as Moment;

    render(<MomentsMasonry {...defaults} moments={[mixed]} />);

    expect(screen.getByAltText('Mixed')).toHaveAttribute('src', 'https://cdn.tukai.co/real.jpg');
  });

  it('shows loading tiles while the next page is in flight', () => {
    const { container } = render(
      <MomentsMasonry {...defaults} isLoadingMore moments={[makeMoment('a', 1, 1)]} />,
    );

    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
  });
});

// Discover reuses this grid at full content width, so the column count has to
// be settable rather than baked in
describe('column count', () => {
  // Two columns on a phone so the feed reads as a grid, widening from md
  it('starts at two columns and widens with the screen', () => {
    const { container } = render(
      <MomentsMasonry {...defaults} moments={[makeMoment('a', 1, 1)]} />,
    );

    const grid = container.querySelector('.columns-2');
    expect(grid).toBeInTheDocument();
    expect(grid).toHaveClass('md:columns-3');
  });

  it('accepts a wider set of columns', () => {
    const { container } = render(
      <MomentsMasonry
        {...defaults}
        moments={[makeMoment('a', 1, 1)]}
        columnsClassName="columns-2 gap-4 md:columns-3 lg:columns-4"
      />,
    );

    expect(container.querySelector('.lg\\:columns-4')).toBeInTheDocument();
  });
});

/**
 * iOS Safari showed one tile with an empty column beside it. Two WebKit
 * behaviours account for that, and both are structural - jsdom renders neither
 * CSS columns nor animations, so what is pinned here is the markup that avoids
 * them rather than the visual result.
 */
describe('surviving WebKit', () => {
  const render1 = () =>
    render(<MomentsMasonry {...defaults} moments={[makeMoment('m1', 400, 600)]} />);

  // WebKit does not measure a `button` correctly as a multi-column child
  it('makes the column item a plain element, not the button', () => {
    const { container } = render1();

    const item = container.querySelector('.break-inside-avoid');
    expect(item?.tagName).toBe('DIV');
    expect(item?.querySelector('button')).toBeInTheDocument();
  });

  it('keeps the column break and its spacing off the button', () => {
    render1();

    const button = screen.getByRole('button');
    expect(button.className).not.toContain('break-inside-avoid');
    expect(button.className).not.toContain('mb-4');
  });

  // `animate-in fade-in` starts the tile at opacity 0, so anywhere the
  // animation does not run the photo never appears at all
  it('does not depend on an animation to become visible', () => {
    render1();

    const button = screen.getByRole('button');
    expect(button.className).not.toContain('animate-in');
    expect(button.className).not.toContain('fade-in');
  });
});

// The card tile is what the Moments page shows: the shared moment card, with
// its caption and byline, rather than a bare photo
describe('card tile', () => {
  const cardMoment = (id: string) =>
    ({
      id,
      title: `Moment ${id}`,
      description: `Caption ${id}`,
      author: {
        id: `u-${id}`,
        firstName: 'Amina',
        lastName: 'Njeri',
        displayName: null,
        picture: null,
      },
      dateCreated: '2026-10-02T09:00:00Z',
      media: [
        {
          id: `md-${id}`,
          photo: `https://cdn.tukai.co/${id}.jpg`,
          width: 800,
          height: 600,
          order: 0,
        },
      ],
    }) as unknown as Moment;

  it('renders each moment as the shared card, with its photo and caption', () => {
    render(
      <MomentsMasonry {...defaults} tile="card" moments={[cardMoment('a'), cardMoment('b')]} />,
    );

    expect(screen.getByAltText('Moment a')).toHaveAttribute('src', 'https://cdn.tukai.co/a.jpg');
    expect(screen.getByText('Caption a')).toBeInTheDocument();
    expect(screen.getByText('Caption b')).toBeInTheDocument();
  });

  it('rings the selected card on its column item', () => {
    render(
      <MomentsMasonry
        {...defaults}
        tile="card"
        selectedId="a"
        moments={[cardMoment('a'), cardMoment('b')]}
      />,
    );

    const tileA = screen.getByAltText('Moment a').closest('.break-inside-avoid');
    const tileB = screen.getByAltText('Moment b').closest('.break-inside-avoid');
    expect(tileA).toHaveClass('ring-primary');
    expect(tileB).not.toHaveClass('ring-primary');
  });

  it('reports the clicked moment id', () => {
    const onSelect = jest.fn();
    render(
      <MomentsMasonry {...defaults} tile="card" onSelect={onSelect} moments={[cardMoment('a')]} />,
    );

    fireEvent.click(screen.getByRole('button'));

    expect(onSelect).toHaveBeenCalledWith('a');
  });

  it('keeps the column item a plain div around the card', () => {
    const { container } = render(
      <MomentsMasonry {...defaults} tile="card" moments={[cardMoment('a')]} />,
    );

    const item = container.querySelector('.break-inside-avoid');
    expect(item?.tagName).toBe('DIV');
    expect(item?.querySelector('button')).toBeInTheDocument();
  });

  it('shows the photo tile by default, without the caption', () => {
    render(<MomentsMasonry {...defaults} moments={[cardMoment('a')]} />);

    expect(screen.queryByText('Caption a')).not.toBeInTheDocument();
    expect(screen.getByAltText('Moment a')).toBeInTheDocument();
  });
});
