import React from 'react';

import { render, screen } from '@testing-library/react';

import { usePopularPlaces } from '@/app/shared/hooks/usePlaces';
import { Place } from '@/types/place';

import { PopularPlaces } from './PopularPlaces';

jest.mock('@/app/shared/hooks/usePlaces');
jest.mock('@/app/(experiences)/components/PlaceCard', () => ({
  PlaceCard: ({ place }: { place: Place }) => (
    <div data-testid={`place-${place.id}`}>{place.title}</div>
  ),
}));

const mockUsePopularPlaces = usePopularPlaces as jest.Mock;

const place = (id: string) => ({ id, title: `Place ${id}` }) as Place;

describe('PopularPlaces', () => {
  it('renders the places under the Popular places heading, in the order the API returns them', () => {
    mockUsePopularPlaces.mockReturnValue({
      data: { data: { results: [place('p2'), place('p1')] } },
      isLoading: false,
    });

    render(<PopularPlaces />);

    expect(screen.getByRole('heading', { level: 2, name: 'Popular places' })).toBeInTheDocument();
    expect(screen.getByText('Ranked by reviews')).toBeInTheDocument();
    expect(screen.getByTestId('place-p2')).toBeInTheDocument();
    expect(screen.getByTestId('place-p1')).toBeInTheDocument();
  });

  it('is hidden when no place comes back, so no empty heading shows', () => {
    mockUsePopularPlaces.mockReturnValue({ data: { data: { results: [] } }, isLoading: false });

    const { container } = render(<PopularPlaces />);

    expect(container).toBeEmptyDOMElement();
  });

  it('shows the heading while loading', () => {
    mockUsePopularPlaces.mockReturnValue({ data: undefined, isLoading: true });

    render(<PopularPlaces />);

    expect(screen.getByRole('heading', { level: 2, name: 'Popular places' })).toBeInTheDocument();
  });
});
