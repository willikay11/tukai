import React from 'react';

import { render, screen } from '@testing-library/react';

import { usePlacesWithExperiences } from '@/app/shared/hooks/usePlaces';
import { Place } from '@/types/place';

import { PlacesWithExperiences } from './PlacesWithExperiences';

jest.mock('@/app/shared/hooks/usePlaces');
jest.mock('@/app/(experiences)/components/PlaceCard', () => ({
  PlaceCard: ({ place }: { place: Place }) => (
    <div data-testid={`place-${place.id}`}>{place.title}</div>
  ),
}));

const mockUsePlacesWithExperiences = usePlacesWithExperiences as jest.Mock;

const place = (id: string) => ({ id, title: `Place ${id}` }) as Place;

describe('PlacesWithExperiences', () => {
  it('renders the places under the Places with experiences heading, with the subtitle', () => {
    mockUsePlacesWithExperiences.mockReturnValue({
      data: { data: { results: [place('p1'), place('p2')] } },
      isLoading: false,
    });

    render(<PlacesWithExperiences />);

    expect(
      screen.getByRole('heading', { level: 2, name: 'Places with experiences' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Each one shows what is happening inside')).toBeInTheDocument();
    expect(screen.getByTestId('place-p1')).toBeInTheDocument();
    expect(screen.getByTestId('place-p2')).toBeInTheDocument();
  });

  it('is hidden when no place has an experience, so no empty heading shows', () => {
    mockUsePlacesWithExperiences.mockReturnValue({
      data: { data: { results: [] } },
      isLoading: false,
    });

    const { container } = render(<PlacesWithExperiences />);

    expect(container).toBeEmptyDOMElement();
  });

  it('shows the heading while loading', () => {
    mockUsePlacesWithExperiences.mockReturnValue({ data: undefined, isLoading: true });

    render(<PlacesWithExperiences />);

    expect(
      screen.getByRole('heading', { level: 2, name: 'Places with experiences' }),
    ).toBeInTheDocument();
  });
});
