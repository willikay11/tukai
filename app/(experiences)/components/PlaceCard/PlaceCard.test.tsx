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
const useLocation = jest.fn();
jest.mock('@/context/LocationContext', () => ({
  useLocation: () => useLocation(),
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
    location: { city: 'Karen', name: 'Karen Rd', pointLat: -1.333, pointLong: 36.883 },
    averageRating: 4.6,
    totalReviews: 12,
    isBookmarked: false,
    ...overrides,
  }) as unknown as Place;

describe('PlaceCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    usePlaceDrawer.mockReturnValue({ openPlace, closePlace: jest.fn(), openPlaceId: null });
    useLocation.mockReturnValue({ isUsingLocation: false, lat: undefined, lng: undefined });
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

  // Distance takes the line over the city once the reader has opted into
  // their own location
  describe('the distance line', () => {
    it('shows the city when the reader has not opted into their location', () => {
      render(<PlaceCard place={makePlace()} />);

      expect(screen.getByText('Karen')).toBeInTheDocument();
      expect(screen.queryByText(/km away/)).not.toBeInTheDocument();
    });

    it('shows the distance once the reader has opted in and coordinates are known', () => {
      useLocation.mockReturnValue({ isUsingLocation: true, lat: -1.286, lng: 36.817 });

      render(<PlaceCard place={makePlace()} />);

      expect(screen.getByText(/km away/)).toBeInTheDocument();
      expect(screen.queryByText('Karen')).not.toBeInTheDocument();
    });

    // Opted in with no fix yet: nothing to measure the distance against
    it('falls back to the city when opted in but no coordinates are known', () => {
      useLocation.mockReturnValue({ isUsingLocation: true, lat: undefined, lng: undefined });

      render(<PlaceCard place={makePlace()} />);

      expect(screen.getByText('Karen')).toBeInTheDocument();
    });

    // Regression: the list payload does not guarantee the place's own
    // coordinates, which previously rendered as "NaN km away"
    it('falls back to the city when the place has no coordinates of its own', () => {
      useLocation.mockReturnValue({ isUsingLocation: true, lat: -1.286, lng: 36.817 });

      render(
        <PlaceCard
          place={makePlace({
            location: { city: 'Karen', pointLat: undefined, pointLong: undefined } as never,
          })}
        />,
      );

      expect(screen.getByText('Karen')).toBeInTheDocument();
      expect(screen.queryByText(/NaN/)).not.toBeInTheDocument();
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
