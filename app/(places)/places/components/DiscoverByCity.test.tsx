import React from 'react';

import { fireEvent, render, screen } from '@testing-library/react';

import { usePlaceCategories } from '@/app/shared/hooks/usePlaces';
import { useSelectedCategory } from '@/context/SelectedCategoryContext';
import { PlaceCategory } from '@/types/placeCategory';

import { DISCOVER_BY_CITY_SUBTITLE, DiscoverByCity } from './DiscoverByCity';

jest.mock('@/app/shared/hooks/usePlaces');
jest.mock('@/context/SelectedCategoryContext');
jest.mock('next/link', () => {
  function MockLink({ children, href, ...rest }: Record<string, unknown>) {
    return (
      <a href={href as string} {...rest}>
        {children as React.ReactNode}
      </a>
    );
  }
  MockLink.displayName = 'MockLink';
  return MockLink;
});
jest.mock('@/app/shared/components/Images', () => ({
  PhotoImage: () => null,
}));

const mockUsePlaceCategories = usePlaceCategories as jest.Mock;
const mockUseSelectedCategory = useSelectedCategory as jest.Mock;

const city = (id: string, name: string, placesCount: number, group = 'cities') =>
  ({ id, name, placesCount, group }) as PlaceCategory;

const setSelected = jest.fn();

const useCities = (results: PlaceCategory[], isLoading = false) =>
  mockUsePlaceCategories.mockReturnValue({
    data: { data: { results } },
    isLoading,
  });

describe('DiscoverByCity', () => {
  beforeEach(() => {
    setSelected.mockReset();
    mockUseSelectedCategory.mockReturnValue({
      selectedCitySearchId: undefined,
      setSelectedCitySearchId: setSelected,
    });
  });

  it('shows the Discover by city heading and the design subtitle', () => {
    useCities([city('1', 'Nairobi', 5)]);

    render(<DiscoverByCity />);

    expect(screen.getByRole('heading', { level: 2, name: 'Discover by city' })).toBeInTheDocument();
    expect(screen.getByText(DISCOVER_BY_CITY_SUBTITLE)).toBeInTheDocument();
  });

  it('shows a card for each city, ordered by how many places it has', () => {
    useCities([city('1', 'Naivasha', 2), city('2', 'Nairobi', 9)]);

    render(<DiscoverByCity />);

    const names = screen.getAllByRole('button').map((button) => button.textContent);
    expect(names).toEqual(['Nairobi', 'Naivasha']);
  });

  it('leaves out categories that are not cities', () => {
    useCities([city('1', 'Nairobi', 5), city('2', 'Studio', 4, 'categories')]);

    render(<DiscoverByCity />);

    expect(screen.queryByRole('button', { name: 'Studio' })).not.toBeInTheDocument();
  });

  it('narrows the places to the city picked', () => {
    useCities([city('1', 'Nairobi', 5)]);

    render(<DiscoverByCity />);
    fireEvent.click(screen.getByRole('button', { name: 'Nairobi' }));

    expect(setSelected).toHaveBeenCalledWith('1');
  });

  it('presses the card for the city the places are narrowed to', () => {
    useCities([city('1', 'Nairobi', 5), city('2', 'Naivasha', 3)]);
    mockUseSelectedCategory.mockReturnValue({
      selectedCitySearchId: '2',
      setSelectedCitySearchId: setSelected,
    });

    render(<DiscoverByCity />);

    expect(screen.getByRole('button', { name: 'Naivasha' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: 'Nairobi' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('lets go of the city when it is picked again', () => {
    useCities([city('1', 'Nairobi', 5)]);
    mockUseSelectedCategory.mockReturnValue({
      selectedCitySearchId: '1',
      setSelectedCitySearchId: setSelected,
    });

    render(<DiscoverByCity />);
    fireEvent.click(screen.getByRole('button', { name: 'Nairobi' }));

    expect(setSelected).toHaveBeenCalledWith('');
  });

  it('is hidden when no cities load, so no empty heading shows', () => {
    useCities([]);

    const { container } = render(<DiscoverByCity />);

    expect(container).toBeEmptyDOMElement();
  });

  it('shows the heading while loading', () => {
    mockUsePlaceCategories.mockReturnValue({ data: undefined, isLoading: true });

    render(<DiscoverByCity />);

    expect(screen.getByRole('heading', { level: 2, name: 'Discover by city' })).toBeInTheDocument();
  });
});
