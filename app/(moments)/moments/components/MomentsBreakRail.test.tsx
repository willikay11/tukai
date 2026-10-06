import React from 'react';

import { render, screen } from '@testing-library/react';

import { usePlaces } from '@/app/shared/hooks/usePlaces';
import { useLocation } from '@/context/LocationContext';
import { Place } from '@/types/place';
import { PlaceCategory } from '@/types/placeCategory';

import { MomentsBreakRail } from './MomentsBreakRail';

jest.mock('@/app/shared/hooks/usePlaces');
jest.mock('@/context/LocationContext', () => ({ useLocation: jest.fn() }));
jest.mock('@/app/(places)/places/components/NearbyPlaceCard', () => ({
  NearbyPlaceCard: ({ place, distanceKm }: { place: Place; distanceKm?: number }) => (
    <div data-testid={`place-${place.id}`}>
      {`${place.title} ${distanceKm === undefined ? 'no distance' : Math.round(distanceKm)}`}
    </div>
  ),
}));

const mockUsePlaces = usePlaces as jest.Mock;
const mockUseLocation = useLocation as jest.Mock;

const category = {
  id: 'cafe-id',
  name: 'Cafe',
  group: 'interests',
  icon: '',
  placesCount: 3,
} as PlaceCategory;

/** Nairobi CBD, the reader's origin in these tests. */
const origin = { lat: -1.2921, lng: 36.8219, isUsingLocation: true };

const placeAt = (id: string, pointLat?: number, pointLong?: number) =>
  ({
    id,
    title: `Place ${id}`,
    location: { pointLat, pointLong },
  }) as unknown as Place;

const near = placeAt('near', -1.3, 36.82); // about 1 km away
const far = placeAt('far', -1.2921, 36.95); // about 14 km away
const unlocated = placeAt('unlocated');

const placesLoaded = (results: Place[]) =>
  mockUsePlaces.mockReturnValue({ data: { data: { results } }, isLoading: false });

describe('MomentsBreakRail', () => {
  beforeEach(() => {
    mockUseLocation.mockReturnValue({ lat: undefined, lng: undefined, isUsingLocation: false });
  });

  it('titles the rail with its category', () => {
    placesLoaded([near]);

    render(<MomentsBreakRail category={category} />);

    expect(screen.getByRole('heading', { name: 'Cafe' })).toBeInTheDocument();
  });

  it('is hidden when the category loaded empty, so no heading shows alone', () => {
    placesLoaded([]);

    const { container } = render(<MomentsBreakRail category={category} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('asks for the places of its own category', () => {
    placesLoaded([near]);

    render(<MomentsBreakRail category={category} />);

    expect(mockUsePlaces).toHaveBeenCalledWith(
      expect.objectContaining({ categoryId: 'cafe-id', page: 1 }),
    );
  });

  it('sorts nearest first, with a distance, when location is in use', () => {
    mockUseLocation.mockReturnValue({ ...origin, lat: origin.lat, lng: origin.lng });
    placesLoaded([far, unlocated, near]);

    render(<MomentsBreakRail category={category} />);

    const titles = screen.getAllByTestId(/^place-/).map((element) => element.textContent);

    expect(titles).toEqual(['Place near 1', 'Place far 14', 'Place unlocated no distance']);
  });

  it('keeps the API order and shows no distance without location', () => {
    placesLoaded([far, near]);

    render(<MomentsBreakRail category={category} />);

    const titles = screen.getAllByTestId(/^place-/).map((element) => element.textContent);

    expect(titles).toEqual(['Place far no distance', 'Place near no distance']);
  });
});
