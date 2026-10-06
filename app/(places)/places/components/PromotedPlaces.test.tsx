import React from 'react';

import { render, screen } from '@testing-library/react';

import { useFeaturedPlaces } from '@/app/shared/hooks/usePlaces';
import { Place } from '@/types/place';

import { PromotedPlaces } from './PromotedPlaces';

jest.mock('@/app/shared/hooks/usePlaces');
jest.mock('@/app/(experiences)/components/PlaceCard', () => ({
  PlaceCard: ({ place }: { place: Place }) => (
    <div data-testid={`place-${place.id}`}>{place.title}</div>
  ),
}));

const mockUseFeaturedPlaces = useFeaturedPlaces as jest.Mock;

const place = (id: string) => ({ id, title: `Place ${id}` }) as Place;

describe('PromotedPlaces', () => {
  it('renders the featured places under the Promoted places heading', () => {
    mockUseFeaturedPlaces.mockReturnValue({
      data: { data: { results: [place('p1'), place('p2')] } },
      isLoading: false,
    });

    render(<PromotedPlaces />);

    expect(screen.getByRole('heading', { level: 2, name: 'Promoted places' })).toBeInTheDocument();
    expect(screen.getByTestId('place-p1')).toBeInTheDocument();
    expect(screen.getByTestId('place-p2')).toBeInTheDocument();
  });

  it('is hidden when nothing is featured, so no empty heading shows', () => {
    mockUseFeaturedPlaces.mockReturnValue({ data: { data: { results: [] } }, isLoading: false });

    const { container } = render(<PromotedPlaces />);

    expect(container).toBeEmptyDOMElement();
  });

  it('shows the heading while loading', () => {
    mockUseFeaturedPlaces.mockReturnValue({ data: undefined, isLoading: true });

    render(<PromotedPlaces />);

    expect(screen.getByRole('heading', { level: 2, name: 'Promoted places' })).toBeInTheDocument();
  });
});
