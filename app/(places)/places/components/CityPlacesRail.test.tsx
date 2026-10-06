import React from 'react';

import { render, screen } from '@testing-library/react';

import { usePlacesInCity } from '@/app/shared/hooks/usePlaces';
import { Place } from '@/types/place';
import { PlaceCategory } from '@/types/placeCategory';

import { CityPlacesRail } from './CityPlacesRail';

jest.mock('@/app/shared/hooks/usePlaces');
jest.mock('@/app/(experiences)/components/PlaceCard', () => ({
  PlaceCard: ({ place }: { place: Place }) => (
    <div data-testid={`place-${place.id}`}>{place.title}</div>
  ),
}));

const mockUsePlacesInCity = usePlacesInCity as jest.Mock;

const nairobi = { id: '1', name: 'Nairobi', placesCount: 5, group: 'cities' } as PlaceCategory;
const place = (id: string) => ({ id, title: `Place ${id}` }) as unknown as Place;

describe('CityPlacesRail', () => {
  it('queries the places in this city', () => {
    mockUsePlacesInCity.mockReturnValue({ data: { data: { results: [] } }, isLoading: false });

    render(<CityPlacesRail city={nairobi} />);

    expect(mockUsePlacesInCity).toHaveBeenCalledWith('1');
  });

  it('renders the city heading and its places', () => {
    mockUsePlacesInCity.mockReturnValue({
      data: { data: { results: [place('a'), place('b')] } },
      isLoading: false,
    });

    render(<CityPlacesRail city={nairobi} />);

    expect(
      screen.getByRole('heading', { level: 2, name: 'Places in Nairobi' }),
    ).toBeInTheDocument();
    expect(screen.getByTestId('place-a')).toBeInTheDocument();
    expect(screen.getByTestId('place-b')).toBeInTheDocument();
  });

  it('hides itself when the city has no places', () => {
    mockUsePlacesInCity.mockReturnValue({ data: { data: { results: [] } }, isLoading: false });

    const { container } = render(<CityPlacesRail city={nairobi} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('shows its heading while loading', () => {
    mockUsePlacesInCity.mockReturnValue({ data: undefined, isLoading: true });

    render(<CityPlacesRail city={nairobi} />);

    expect(
      screen.getByRole('heading', { level: 2, name: 'Places in Nairobi' }),
    ).toBeInTheDocument();
  });
});
