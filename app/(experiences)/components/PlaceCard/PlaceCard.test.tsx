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

  it('links to the place detail page', () => {
    render(<PlaceCard place={makePlace()} />);

    expect(screen.getByRole('link')).toHaveAttribute('href', '/places/p1');
  });

  // The canvas draws its place media square, at 184px
  it('is a square tile at the canvas width', () => {
    const { container } = render(<PlaceCard place={makePlace()} />);

    expect(screen.getByRole('link')).toHaveClass('w-[184px]');
    expect(container.querySelector('.aspect-square')).toBeInTheDocument();
  });

  /**
   * One line of substance under the name. The canvas leads with something
   * happening at the place; we have no such field, so it leads with what
   * people made of it — see `place-fact`.
   */
  describe('the fact line', () => {
    it('leads with the score and how many reviews it came from', () => {
      render(<PlaceCard place={makePlace({ averageRating: 4.5, totalReviews: 23 })} />);

      expect(screen.getByText('4.5 · 23 reviews')).toBeInTheDocument();
    });

    it('says one review in the singular', () => {
      render(<PlaceCard place={makePlace({ averageRating: 5, totalReviews: 1 })} />);

      expect(screen.getByText('5 · 1 review')).toBeInTheDocument();
    });

    // Regression: categories[0] is often a city, which is not the kind of place
    it('falls back to the kind of place, not the city', () => {
      render(<PlaceCard place={makePlace({ averageRating: 0, totalReviews: 0 })} />);

      expect(screen.getByText('Restaurants')).toBeInTheDocument();
    });

    it('says so when there is nothing else to say', () => {
      render(
        <PlaceCard
          place={makePlace({ averageRating: 0, totalReviews: 0, categories: [] as never })}
        />,
      );

      expect(screen.getByText('No reviews yet')).toBeInTheDocument();
    });
  });
});
