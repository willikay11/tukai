import React from 'react';

import { render, screen, within } from '@testing-library/react';

import { useNearbyPlaces } from '@/app/shared/hooks/usePlaces';
import { useLocation } from '@/context/LocationContext';
import { Place } from '@/types/place';

import { NearbyPlaces } from './NearbyPlaces';

jest.mock('@/app/shared/hooks/usePlaces');
jest.mock('@/context/LocationContext', () => ({ useLocation: jest.fn() }));
jest.mock('@/app/(experiences)/components/PlaceCard', () => ({
  PlaceCard: ({ place }: { place: Place }) => (
    <div data-testid={`place-${place.id}`}>{place.title}</div>
  ),
}));

const mockUseNearbyPlaces = useNearbyPlaces as jest.Mock;
const mockUseLocation = useLocation as jest.Mock;

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

describe('NearbyPlaces', () => {
  beforeEach(() => {
    mockUseLocation.mockReturnValue(origin);
  });

  it('renders the places under the Nearby places heading, with the distance subtitle', () => {
    mockUseNearbyPlaces.mockReturnValue({
      data: { data: { results: [near, far] } },
      isLoading: false,
    });

    render(<NearbyPlaces />);

    expect(screen.getByRole('heading', { level: 2, name: 'Nearby places' })).toBeInTheDocument();
    expect(screen.getByText('Sorted by distance from you')).toBeInTheDocument();
    expect(screen.getByTestId('place-near')).toBeInTheDocument();
    expect(screen.getByTestId('place-far')).toBeInTheDocument();
  });

  it('sorts the places by distance from the reader, nearest first', () => {
    mockUseNearbyPlaces.mockReturnValue({
      // The API's order is not trusted: the far place arrives first
      data: { data: { results: [far, near] } },
      isLoading: false,
    });

    const { container } = render(<NearbyPlaces />);

    const titles = within(container)
      .getAllByTestId(/^place-/)
      .map((element) => element.textContent);
    expect(titles).toEqual(['Place near', 'Place far']);
  });

  it('sorts places without coordinates after those with them', () => {
    mockUseNearbyPlaces.mockReturnValue({
      data: { data: { results: [unlocated, far] } },
      isLoading: false,
    });

    const { container } = render(<NearbyPlaces />);

    const titles = within(container)
      .getAllByTestId(/^place-/)
      .map((element) => element.textContent);
    expect(titles).toEqual(['Place far', 'Place unlocated']);
  });

  it('asks for places only once the reader has an origin', () => {
    mockUseNearbyPlaces.mockReturnValue({ data: undefined, isLoading: false });

    render(<NearbyPlaces />);

    expect(mockUseNearbyPlaces).toHaveBeenCalledWith(origin.lat, origin.lng);
  });

  it('is hidden when the reader has no location', () => {
    mockUseLocation.mockReturnValue({ lat: undefined, lng: undefined, isUsingLocation: false });
    mockUseNearbyPlaces.mockReturnValue({ data: undefined, isLoading: false });

    const { container } = render(<NearbyPlaces />);

    expect(container).toBeEmptyDOMElement();
    expect(mockUseNearbyPlaces).toHaveBeenCalledWith(undefined, undefined);
  });

  it('is hidden when the reader has stepped off their location, though it is still known', () => {
    mockUseLocation.mockReturnValue({ ...origin, isUsingLocation: false });
    mockUseNearbyPlaces.mockReturnValue({
      data: { data: { results: [near] } },
      isLoading: false,
    });

    const { container } = render(<NearbyPlaces />);

    expect(container).toBeEmptyDOMElement();
  });

  it('is hidden when nothing is nearby, so no empty heading shows', () => {
    mockUseNearbyPlaces.mockReturnValue({ data: { data: { results: [] } }, isLoading: false });

    const { container } = render(<NearbyPlaces />);

    expect(container).toBeEmptyDOMElement();
  });

  it('shows the heading while loading', () => {
    mockUseNearbyPlaces.mockReturnValue({ data: undefined, isLoading: true });

    render(<NearbyPlaces />);

    expect(screen.getByRole('heading', { level: 2, name: 'Nearby places' })).toBeInTheDocument();
  });
});
