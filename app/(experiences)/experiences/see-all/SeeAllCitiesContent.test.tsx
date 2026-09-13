import React from 'react';

import { render, screen } from '@testing-library/react';

import { usePlaceCategories } from '@/app/shared/hooks/usePlaces';
import { PlaceCategory } from '@/types/placeCategory';

import { SeeAllCitiesContent } from './SeeAllCitiesContent';

jest.mock('@/app/shared/hooks/usePlaces');
jest.mock('next/navigation', () => ({ useRouter: () => ({ push: jest.fn(), back: jest.fn() }) }));
jest.mock('next/image', () => {
  function MockImage({ alt }: { alt: string }) {
    return <img alt={alt} />;
  }
  MockImage.displayName = 'MockImage';
  return MockImage;
});

const mockUsePlaceCategories = usePlaceCategories as jest.MockedFunction<typeof usePlaceCategories>;

const city = (name: string, placesCount: number, group = 'cities'): PlaceCategory => ({
  id: name.toLowerCase(),
  name,
  icon: '',
  group,
  placesCount,
  images: [{ id: `${name}-1`, imageUrl: `https://cdn.tukai.co/${name}.jpg` }],
});

// Only the two fields this component reads
const mockResult = (results: PlaceCategory[] | undefined, isLoading = false) =>
  mockUsePlaceCategories.mockReturnValue({
    data: results ? { status: 200, success: true, data: { results } } : undefined,
    isLoading,
  } as unknown as ReturnType<typeof usePlaceCategories>);

describe('SeeAllCitiesContent', () => {
  it('renders the see-all chrome for the cities section', () => {
    mockResult([city('Nairobi', 42)]);
    render(<SeeAllCitiesContent />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Experiences by City');
    expect(screen.getByText('Browse by destination · 1 city')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Discover' })).toHaveAttribute('href', '/experiences');
    expect(screen.getByRole('button', { name: /Back/ })).toBeInTheDocument();
  });

  it("points each city at that city's experiences, not at places", () => {
    mockResult([city('Nairobi', 42), city('Diani Beach', 7)]);
    render(<SeeAllCitiesContent />);

    expect(screen.getByRole('link', { name: /Nairobi/ })).toHaveAttribute(
      'href',
      '/experiences/see-all?type=city&city=Nairobi',
    );
    expect(screen.getByRole('link', { name: /Diani Beach/ })).toHaveAttribute(
      'href',
      '/experiences/see-all?type=city&city=Diani%20Beach',
    );
  });

  it('sorts destinations by size and drops other category groups', () => {
    mockResult([city('Lamu', 3), city('Sushi', 99, 'cuisine'), city('Nairobi', 42)]);
    render(<SeeAllCitiesContent />);

    const cityNames = screen
      .getAllByRole('link')
      .map((link) => link.getAttribute('href'))
      .filter((href) => href?.startsWith('/experiences/see-all?type=city'));

    expect(cityNames).toEqual([
      '/experiences/see-all?type=city&city=Nairobi',
      '/experiences/see-all?type=city&city=Lamu',
    ]);
    expect(screen.getByText('Browse by destination · 2 cities')).toBeInTheDocument();
  });

  it('shows skeletons while the categories load', () => {
    mockResult(undefined, true);
    const { container } = render(<SeeAllCitiesContent />);

    expect(container.querySelectorAll('.animate-pulse')).toHaveLength(8);
    expect(screen.getByText('Browse by destination')).toBeInTheDocument();
  });

  it('shows the empty state when there are no cities', () => {
    mockResult([]);
    render(<SeeAllCitiesContent />);

    expect(screen.getByText('No cities to explore yet')).toBeInTheDocument();
  });
});
