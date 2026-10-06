import React from 'react';

import { render, screen, within } from '@testing-library/react';

import { useNearbyPlaces, usePlaceCategories } from '@/app/shared/hooks/usePlaces';
import { useLocation } from '@/context/LocationContext';
import { useSelectedCategory } from '@/context/SelectedCategoryContext';
import { Place } from '@/types/place';

import { NEARBY_PLACES_COUNT, NearbyPlaces } from './NearbyPlaces';

jest.mock('@/app/shared/hooks/usePlaces');
jest.mock('@/context/LocationContext', () => ({ useLocation: jest.fn() }));
jest.mock('@/context/SelectedCategoryContext', () => ({ useSelectedCategory: jest.fn() }));
jest.mock('./NearbyPlaceCard', () => ({
  NearbyPlaceCard: ({ place, distanceKm }: { place: Place; distanceKm?: number }) => (
    <div data-testid={`place-${place.id}`}>
      {`${place.title} ${distanceKm === undefined ? 'no distance' : Math.round(distanceKm)}`}
    </div>
  ),
}));

const mockUseNearbyPlaces = useNearbyPlaces as jest.Mock;
const mockUsePlaceCategories = usePlaceCategories as jest.Mock;
const mockUseLocation = useLocation as jest.Mock;
const mockUseSelectedCategory = useSelectedCategory as jest.Mock;

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

const categories = [
  { id: 'cafe-id', name: 'Cafe', group: 'interests', icon: '', placesCount: 3 },
  { id: 'garden-id', name: 'Garden', group: 'interests', icon: '', placesCount: 2 },
];

const titlesIn = (container: HTMLElement) =>
  within(container)
    .getAllByTestId(/^place-/)
    .map((element) => element.textContent);

describe('NearbyPlaces', () => {
  beforeEach(() => {
    mockUseLocation.mockReturnValue(origin);
    mockUseSelectedCategory.mockReturnValue({ selectedCategoryId: 'all' });
    mockUsePlaceCategories.mockReturnValue({ data: { data: { results: categories } } });
  });

  it('renders the places under the Nearby restaurants heading by default, with the distance subtitle', () => {
    mockUseNearbyPlaces.mockReturnValue({
      data: { data: { results: [near, far] } },
      isLoading: false,
    });

    render(<NearbyPlaces />);

    expect(
      screen.getByRole('heading', { level: 2, name: 'Nearby restaurants' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Sorted by distance from you')).toBeInTheDocument();
    expect(screen.getByTestId('place-near')).toBeInTheDocument();
    expect(screen.getByTestId('place-far')).toBeInTheDocument();
  });

  it('names the selected category in the title, lowercased, and asks for that category only', () => {
    mockUseSelectedCategory.mockReturnValue({ selectedCategoryId: 'cafe-id' });
    mockUseNearbyPlaces.mockReturnValue({ data: undefined, isLoading: true });

    render(<NearbyPlaces />);

    expect(screen.getByRole('heading', { level: 2, name: 'Nearby cafe' })).toBeInTheDocument();
    expect(mockUseNearbyPlaces).toHaveBeenCalledWith(origin.lat, origin.lng, 'cafe-id');
  });

  it('asks for every category when none is selected', () => {
    mockUseNearbyPlaces.mockReturnValue({ data: undefined, isLoading: true });

    render(<NearbyPlaces />);

    expect(mockUseNearbyPlaces).toHaveBeenCalledWith(origin.lat, origin.lng, undefined);
  });

  it('sorts the places by distance from the reader, nearest first', () => {
    mockUseNearbyPlaces.mockReturnValue({
      // The API's order is not trusted: the far place arrives first
      data: { data: { results: [far, near] } },
      isLoading: false,
    });

    const { container } = render(<NearbyPlaces />);

    expect(titlesIn(container)).toEqual(['Place near 1', 'Place far 14']);
  });

  it('sorts places without coordinates after those with them', () => {
    mockUseNearbyPlaces.mockReturnValue({
      data: { data: { results: [unlocated, far] } },
      isLoading: false,
    });

    const { container } = render(<NearbyPlaces />);

    expect(titlesIn(container)).toEqual(['Place far 14', 'Place unlocated no distance']);
  });

  it('shows at most eight places, the nearest eight', () => {
    const many = Array.from({ length: 10 }, (_, index) =>
      placeAt(`p${index}`, -1.2921 + index * 0.01, 36.8219),
    );
    mockUseNearbyPlaces.mockReturnValue({
      data: { data: { results: [...many].reverse() } },
      isLoading: false,
    });

    const { container } = render(<NearbyPlaces />);

    const shown = titlesIn(container);
    expect(NEARBY_PLACES_COUNT).toBe(8);
    expect(shown).toHaveLength(8);
    expect(shown[0]).toContain('Place p0');
    expect(shown.some((title) => title?.includes('Place p8'))).toBe(false);
    expect(shown.some((title) => title?.includes('Place p9'))).toBe(false);
  });

  it('asks for places only once the reader has an origin', () => {
    mockUseNearbyPlaces.mockReturnValue({ data: undefined, isLoading: false });

    render(<NearbyPlaces />);

    expect(mockUseNearbyPlaces).toHaveBeenCalledWith(origin.lat, origin.lng, undefined);
  });

  it('is hidden when the reader has no location', () => {
    mockUseLocation.mockReturnValue({ lat: undefined, lng: undefined, isUsingLocation: false });
    mockUseNearbyPlaces.mockReturnValue({ data: undefined, isLoading: false });

    const { container } = render(<NearbyPlaces />);

    expect(container).toBeEmptyDOMElement();
    expect(mockUseNearbyPlaces).toHaveBeenCalledWith(undefined, undefined, undefined);
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

  it('shows the heading and placeholder cards while loading', () => {
    mockUseNearbyPlaces.mockReturnValue({ data: undefined, isLoading: true });

    const { container } = render(<NearbyPlaces />);

    expect(
      screen.getByRole('heading', { level: 2, name: 'Nearby restaurants' }),
    ).toBeInTheDocument();
    expect(container.querySelectorAll('.animate-pulse')).toHaveLength(NEARBY_PLACES_COUNT);
  });
});
