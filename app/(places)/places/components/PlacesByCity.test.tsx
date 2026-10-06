import React from 'react';

import { render, screen } from '@testing-library/react';

import { usePlaceCategories, usePlacesInCity } from '@/app/shared/hooks/usePlaces';
import { Place } from '@/types/place';
import { PlaceCategory } from '@/types/placeCategory';

import { PLACES_BY_CITY_RAIL_COUNT, PlacesByCity } from './PlacesByCity';

jest.mock('@/app/shared/hooks/usePlaces');
jest.mock('@/app/(experiences)/components/PlaceCard', () => ({
  PlaceCard: ({ place }: { place: Place }) => (
    <div data-testid={`place-${place.id}`}>{place.title}</div>
  ),
}));

const mockUsePlaceCategories = usePlaceCategories as jest.Mock;
const mockUsePlacesInCity = usePlacesInCity as jest.Mock;

const city = (id: string, name: string, placesCount: number, group = 'cities') =>
  ({ id, name, placesCount, group }) as PlaceCategory;

const place = (id: string) => ({ id, title: `Place ${id}` }) as unknown as Place;

/** Each city's places, keyed by the city's id, as the hook is called once per city. */
const placesByCity = (byId: Record<string, { results?: Place[]; isLoading?: boolean }>) =>
  mockUsePlacesInCity.mockImplementation((cityId: string) => {
    const entry = byId[cityId] ?? {};
    return {
      data: { data: { results: entry.results ?? [] } },
      isLoading: entry.isLoading ?? false,
    };
  });

const useCities = (results: PlaceCategory[]) =>
  mockUsePlaceCategories.mockReturnValue({ data: { data: { results } }, isLoading: false });

describe('PlacesByCity', () => {
  beforeEach(() => {
    mockUsePlacesInCity.mockClear();
  });

  it('renders a rail per city, titled with the city, busiest first', () => {
    useCities([city('1', 'Nairobi', 5), city('2', 'Mombasa', 9)]);
    placesByCity({ 1: { results: [place('a')] }, 2: { results: [place('b')] } });

    render(<PlacesByCity />);

    const headings = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent);
    expect(headings).toEqual(['Places in Mombasa', 'Places in Nairobi']);
    expect(screen.getByTestId('place-b')).toBeInTheDocument();
    expect(screen.getByTestId('place-a')).toBeInTheDocument();
  });

  it('ignores categories that are not cities', () => {
    useCities([city('1', 'Nairobi', 5), city('2', 'Studio', 50, 'types')]);
    placesByCity({ 1: { results: [place('a')] } });

    render(<PlacesByCity />);

    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(1);
    const queriedIds = mockUsePlacesInCity.mock.calls.map(([cityId]) => cityId);
    expect(queriedIds).not.toContain('2');
  });

  it('shows at most the rail count of cities', () => {
    const many = Array.from({ length: PLACES_BY_CITY_RAIL_COUNT + 2 }, (_, index) =>
      city(`${index}`, `City ${index}`, index),
    );
    useCities(many);
    placesByCity({});

    render(<PlacesByCity />);

    expect(mockUsePlacesInCity).toHaveBeenCalledTimes(PLACES_BY_CITY_RAIL_COUNT);
  });

  it('hides a city rail that loaded empty, and shows nothing when there are no cities', () => {
    useCities([city('1', 'Nairobi', 5), city('2', 'Mombasa', 9)]);
    placesByCity({ 1: { results: [place('a')] } });

    render(<PlacesByCity />);

    expect(screen.queryByRole('heading', { name: 'Places in Mombasa' })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Places in Nairobi' })).toBeInTheDocument();
  });

  it('renders nothing when no cities load', () => {
    useCities([]);

    const { container } = render(<PlacesByCity />);

    expect(container).toBeEmptyDOMElement();
  });
});
