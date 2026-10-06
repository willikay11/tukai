import React from 'react';

import { fireEvent, render, screen } from '@testing-library/react';

import { usePlaceDrawer } from '@/context/PlaceDrawerContext';
import { Place } from '@/types/place';

import { NearbyPlaceCard } from './NearbyPlaceCard';

jest.mock('@/context/PlaceDrawerContext', () => ({ usePlaceDrawer: jest.fn() }));
jest.mock('next/image', () => {
  function MockImage({ alt, src }: { alt: string; src: string }) {
    return <img alt={alt} src={src} />;
  }
  MockImage.displayName = 'MockImage';
  return MockImage;
});

const mockUsePlaceDrawer = usePlaceDrawer as jest.Mock;

const place = {
  id: 'p1',
  slug: 'talisman',
  title: 'Talisman',
  photos: [],
  categories: [
    { id: 'c1', name: 'Nairobi', group: 'cities', icon: '', placesCount: 0 },
    { id: 'c2', name: 'Restaurants', group: 'interests', icon: '', placesCount: 0 },
  ],
} as unknown as Place;

describe('NearbyPlaceCard', () => {
  it('shows the name, the kind of place and the distance', () => {
    mockUsePlaceDrawer.mockReturnValue({ openPlace: jest.fn() });

    render(<NearbyPlaceCard place={place} distanceKm={1.14} />);

    expect(screen.getByText('Talisman')).toBeInTheDocument();
    expect(screen.getByText('Restaurants')).toBeInTheDocument();
    expect(screen.getByText('1.1 km away')).toBeInTheDocument();
  });

  it('says less than 0.1 km under a hundred metres', () => {
    mockUsePlaceDrawer.mockReturnValue({ openPlace: jest.fn() });

    render(<NearbyPlaceCard place={place} distanceKm={0.04} />);

    expect(screen.getByText('Less than 0.1 km away')).toBeInTheDocument();
  });

  it('leaves the distance out when there is none, rather than showing a made-up one', () => {
    mockUsePlaceDrawer.mockReturnValue({ openPlace: jest.fn() });

    render(<NearbyPlaceCard place={place} />);

    expect(screen.queryByText(/km away/)).not.toBeInTheDocument();
  });

  it('opens the place in the drawer when one is above it', () => {
    const openPlace = jest.fn();
    mockUsePlaceDrawer.mockReturnValue({ openPlace });

    render(<NearbyPlaceCard place={place} distanceKm={3} />);

    fireEvent.click(screen.getByRole('button', { name: /Talisman/ }));

    expect(openPlace).toHaveBeenCalledWith('p1');
  });

  it('links to the place page with no drawer in the tree', () => {
    mockUsePlaceDrawer.mockReturnValue(null);

    render(<NearbyPlaceCard place={place} distanceKm={3} />);

    expect(screen.getByRole('link', { name: /Talisman/ })).toHaveAttribute(
      'href',
      '/places/talisman',
    );
  });
});
