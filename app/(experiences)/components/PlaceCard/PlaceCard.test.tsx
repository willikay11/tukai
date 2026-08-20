import React from 'react';

import { render, screen } from '@testing-library/react';

import { Place } from '@/types/place';

import { PlaceCard } from './index';

jest.mock('next-auth/react', () => ({ useSession: () => ({ data: null }) }));
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
  function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>;
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
  it('renders cover, title and rating', () => {
    render(<PlaceCard place={makePlace()} />);

    expect(screen.getByAltText('Talisman')).toHaveAttribute('src', 'https://cdn.tukai.co/cover.jpg');
    expect(screen.getByText('Talisman')).toBeInTheDocument();
    expect(screen.getByText('4.6')).toBeInTheDocument();
  });

  // Regression: categories[0] is often a city, which is not the kind of place
  it('shows the interest category, not the city category, before the area', () => {
    render(<PlaceCard place={makePlace()} />);

    expect(screen.getByText('Restaurants · Karen')).toBeInTheDocument();
  });

  it('omits the rating when the place is unrated', () => {
    render(<PlaceCard place={makePlace({ averageRating: 0 })} />);

    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });

  it('links to the place detail page', () => {
    render(<PlaceCard place={makePlace()} />);

    expect(screen.getByRole('link')).toHaveAttribute('href', '/places/p1');
  });

  it('falls back to the location name when there is no city', () => {
    render(
      <PlaceCard
        place={makePlace({ location: { name: 'Karen Rd' } as never })}
      />,
    );

    expect(screen.getByText('Restaurants · Karen Rd')).toBeInTheDocument();
  });
});
