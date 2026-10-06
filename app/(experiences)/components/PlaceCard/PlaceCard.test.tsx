import React from 'react';

import { fireEvent, render, screen } from '@testing-library/react';

import { Place } from '@/types/place';

import { PlaceCard } from './index';

jest.mock('next-auth/react', () => ({ useSession: () => ({ data: null }) }));

const openPlace = jest.fn();
const usePlaceDrawer = jest.fn();
jest.mock('@/context/PlaceDrawerContext', () => ({
  usePlaceDrawer: () => usePlaceDrawer(),
}));
jest.mock('@/app/shared/hooks/usePlaces', () => ({
  useBookmarkPlace: () => ({ mutate: jest.fn() }),
}));
jest.mock('@/app/shared/components/Bookmark', () => ({
  Bookmark: () => <button type="button">bookmark</button>,
}));
jest.mock('next/image', () => {
  function MockImage({ alt, src }: { alt: string; src: string }) {
    return <img alt={alt} src={src} />;
  }
  MockImage.displayName = 'MockImage';
  return MockImage;
});
jest.mock('next/link', () => {
  // Forwards every prop, so class-based assertions see what the card renders
  function MockLink({ children, href, ...rest }: Record<string, unknown>) {
    return (
      <a href={href as string} {...rest}>
        {children as React.ReactNode}
      </a>
    );
  }
  MockLink.displayName = 'MockLink';
  return MockLink;
});

const makePlace = (overrides: Partial<Place> = {}): Place =>
  ({
    id: 'p1',
    title: 'Talisman',
    photos: [{ id: 'ph1', photo: 'https://cdn.tukai.co/cover.jpg', isCover: true }],
    // The API mixes city and interest categories on the same array
    categories: [
      { id: 'c1', name: 'Nairobi', group: 'cities', icon: '', placesCount: 0 },
      { id: 'c2', name: 'Restaurants', group: 'interests', icon: '', placesCount: 0 },
    ],
    location: { city: 'Karen', name: 'Karen Rd' },
    averageRating: 4.6,
    totalReviews: 12,
    isBookmarked: false,
    ...overrides,
  }) as unknown as Place;

describe('PlaceCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    usePlaceDrawer.mockReturnValue({ openPlace, closePlace: jest.fn(), openPlaceId: null });
  });

  it('renders the cover and the title', () => {
    render(<PlaceCard place={makePlace()} />);

    expect(screen.getByAltText('Talisman')).toHaveAttribute(
      'src',
      'https://cdn.tukai.co/cover.jpg',
    );
    expect(screen.getByText('Talisman')).toBeInTheDocument();
  });

  // The canvas puts the area on its own line under the name, not beside the kind
  it('shows the area under the name', () => {
    render(<PlaceCard place={makePlace()} />);

    expect(screen.getByText('Karen')).toBeInTheDocument();
  });

  it('falls back to the location name when there is no city', () => {
    render(<PlaceCard place={makePlace({ location: { name: 'Karen Rd' } as never })} />);

    expect(screen.getByText('Karen Rd')).toBeInTheDocument();
  });

  // A place opens in the drawer, not on a page of its own
  it('is not a link while the drawer is there to open', () => {
    render(<PlaceCard place={makePlace()} />);

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  // The canvas draws its place media square, at 184px
  it('is a square tile at the canvas width', () => {
    const { container } = render(<PlaceCard place={makePlace()} />);

    expect(screen.getByRole('button', { name: 'Talisman' })).toHaveClass('w-[184px]');
    expect(container.querySelector('.aspect-square')).toBeInTheDocument();
  });

  // The same card fills a cell in the "Places with experiences" grid, where a
  // fixed width would leave gaps
  it('fills its cell when the width is overridden', () => {
    render(<PlaceCard place={makePlace()} className="w-full" />);

    const card = screen.getByRole('button', { name: 'Talisman' });
    expect(card).toHaveClass('w-full');
    expect(card).not.toHaveClass('w-[184px]');
  });

  /**
   * One line of substance under the name. The brief leads with an activity
   * happening at the place; the list carries none, so the category shows.
   */
  describe('the fact line', () => {
    // Regression: categories[0] is often a city, which is not the kind of place
    it('shows the kind of place, not the city', () => {
      render(<PlaceCard place={makePlace()} />);

      expect(screen.getByText('Restaurants')).toBeInTheDocument();
      expect(screen.queryByText('Nairobi')).not.toBeInTheDocument();
    });

    it('does not lead with the score', () => {
      render(<PlaceCard place={makePlace({ averageRating: 4.5, totalReviews: 23 })} />);

      expect(screen.queryByText(/4\.5/)).not.toBeInTheDocument();
      expect(screen.getByText('Restaurants')).toBeInTheDocument();
    });

    // Regression: a card with nothing to say leaves the line out rather than
    // saying the place has no reviews
    it('never says "No reviews yet"', () => {
      const { container } = render(
        <PlaceCard
          place={makePlace({ averageRating: 0, totalReviews: 0, categories: [] as never })}
        />,
      );

      expect(screen.queryByText('No reviews yet')).not.toBeInTheDocument();
      expect(container.querySelector('p.text-xs')).not.toBeInTheDocument();
    });
  });

  describe('opening the drawer', () => {
    it('opens the place', () => {
      render(<PlaceCard place={makePlace()} />);

      fireEvent.click(screen.getByRole('button', { name: 'Talisman' }));

      expect(openPlace).toHaveBeenCalledWith('p1');
    });

    it('opens on the keyboard too', () => {
      render(<PlaceCard place={makePlace()} />);

      fireEvent.keyDown(screen.getByRole('button', { name: 'Talisman' }), { key: 'Enter' });

      expect(openPlace).toHaveBeenCalledWith('p1');
    });

    // A card rendered somewhere with no drawer above it falls back to the
    // place's own page, which is the only thing left that can show it
    it('links to the page with no drawer in the tree', () => {
      usePlaceDrawer.mockReturnValue(null);

      render(<PlaceCard place={makePlace()} />);

      expect(screen.getByRole('link')).toHaveAttribute('href', '/places/p1');
      expect(openPlace).not.toHaveBeenCalled();
    });
  });
});
