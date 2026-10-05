import React from 'react';

import { render, screen } from '@testing-library/react';

import { Place } from '@/types/place';

import { PlaceAboutSection } from './PlaceAboutSection';

const useLocation = jest.fn();
jest.mock('@/context/LocationContext', () => ({ useLocation: () => useLocation() }));

jest.mock('@/app/shared/components/Icons', () => ({
  IconComponent: ({ iconName, className }: { iconName: string; className?: string }) => (
    <span data-testid={iconName} className={className} />
  ),
}));
jest.mock('./PlacePhotoStrip', () => ({ PlacePhotoStrip: () => <div data-testid="photos" /> }));
jest.mock('./PlaceFactsGrid', () => ({ PlaceFactsGrid: () => <div data-testid="facts" /> }));
jest.mock('./PlaceSocialPills', () => ({ PlaceSocialPills: () => <div data-testid="socials" /> }));
jest.mock('@/app/shared/components/Global', () => ({
  DescriptionShowMore: ({ text }: { text: string }) => <p>{text}</p>,
  OpenInMapsLink: ({ children }: { children: React.ReactNode }) => <a href="#maps">{children}</a>,
}));

const makePlace = (overrides: Partial<Place> = {}): Place =>
  ({
    id: 'p1',
    title: 'Kazuri Beads Workshop',
    description: 'Two hundred women shaping clay beads by hand.',
    location: { city: 'Nairobi', pointLat: -1.3, pointLong: 36.8 },
    photos: [],
    averageRating: 4.7,
    totalReviews: 14,
    properties: [],
    socialLinks: [],
    ...overrides,
  }) as unknown as Place;

describe('PlaceAboutSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useLocation.mockReturnValue({ lat: undefined, lng: undefined });
  });

  it('shows where the place is', () => {
    render(<PlaceAboutSection place={makePlace()} />);

    expect(screen.getByText('Nairobi')).toBeInTheDocument();
  });

  // Distance is only knowable once the reader has shared where they are
  it('adds the distance once location is granted', () => {
    useLocation.mockReturnValue({ lat: -1.2, lng: 36.8 });

    render(<PlaceAboutSection place={makePlace()} />);

    expect(screen.getByText(/km$/)).toBeInTheDocument();
  });

  it('leaves the distance out without it', () => {
    render(<PlaceAboutSection place={makePlace()} />);

    expect(screen.queryByText(/km$/)).not.toBeInTheDocument();
  });

  describe('the rating line', () => {
    it('sits beside the location with the score and the count', () => {
      render(<PlaceAboutSection place={makePlace()} />);

      expect(screen.getByText('4.7')).toBeInTheDocument();
      expect(screen.getByText('14 reviews')).toBeInTheDocument();
      expect(screen.getByTestId('StarIcon')).toHaveClass('text-star');
    });

    it('says one review in the singular', () => {
      render(<PlaceAboutSection place={makePlace({ totalReviews: 1 })} />);

      expect(screen.getByText('1 review')).toBeInTheDocument();
    });

    it('is left out for a place nobody has rated', () => {
      render(<PlaceAboutSection place={makePlace({ averageRating: 0, totalReviews: 0 })} />);

      expect(screen.queryByTestId('StarIcon')).not.toBeInTheDocument();
    });

    it('counts zero where the API sent no total', () => {
      render(<PlaceAboutSection place={makePlace({ totalReviews: null })} />);

      expect(screen.getByText('0 reviews')).toBeInTheDocument();
    });
  });
});
