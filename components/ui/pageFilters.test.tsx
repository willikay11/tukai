import React from 'react';

import * as nextNavigation from 'next/navigation';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';

import { usePlaceCategories } from '@/hooks/places';

import { PageFilters } from './pageFilters';

// Mock dependencies
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
  useSearchParams: jest.fn(),
}));

jest.mock('@/hooks/places', () => ({
  usePlaceCategories: jest.fn(),
}));

jest.mock('@/app/components/scrollFilters', () => ({
  __esModule: true,
  default: ({ filters }: { filters: any[] }) => (
    <div data-testid="scroll-filters">
      {filters.map((filter) => (
        <div key={filter.value} data-testid={`filter-${filter.value}`}>
          {filter.label}
        </div>
      ))}
    </div>
  ),
}));

jest.mock('@/app/components/skeletons', () => ({
  PillsSkeleton: () => <div data-testid="pills-skeleton">Loading...</div>,
}));

const mockSetSelectedCategoryId = jest.fn();
jest.mock('@/context/SelectedCategoryContext', () => ({
  useSelectedCategory: () => ({
    setSelectedCategoryId: mockSetSelectedCategoryId,
  }),
}));

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(<QueryClientProvider client={queryClient}>{component}</QueryClientProvider>);
};

describe('PageFilters', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Set default mock return value for usePlaceCategories
    (usePlaceCategories as jest.Mock).mockReturnValue({
      data: null,
      isFetching: false,
    });
  });

  describe('Hidden paths', () => {
    it.each([
      '/places/123',
      '/experiences/456',
      '/communities/789',
      '/auth/login',
      '/terms',
      '/privacy',
      '/help',
      '/unsubscribe',
    ])('should not render on %s', (pathname) => {
      (nextNavigation.usePathname as jest.Mock).mockReturnValue(pathname);
      (nextNavigation.useSearchParams as jest.Mock).mockReturnValue({
        get: jest.fn().mockReturnValue(null),
      });

      const { container } = renderWithProviders(<PageFilters />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('Places page', () => {
    const mockCategories = {
      data: {
        results: [
          {
            id: 'cat1',
            name: 'Restaurants',
            icon: 'RestaurantIcon',
            placesCount: 100,
            group: 'food',
          },
          { id: 'cat2', name: 'Cafes', icon: 'CafeIcon', placesCount: 50, group: 'food' },
          { id: 'cat3', name: 'Cities', icon: 'CityIcon', placesCount: 30, group: 'cities' },
        ],
      },
    };

    beforeEach(() => {
      (nextNavigation.usePathname as jest.Mock).mockReturnValue('/places');
      (nextNavigation.useSearchParams as jest.Mock).mockReturnValue({
        get: jest.fn().mockReturnValue(null),
      });
    });

    it('should show loading skeleton while fetching categories', () => {
      (usePlaceCategories as jest.Mock).mockReturnValue({
        data: null,
        isFetching: true,
      });

      renderWithProviders(<PageFilters />);
      expect(screen.getByTestId('pills-skeleton')).toBeInTheDocument();
    });

    it('should render filters for places page', async () => {
      (usePlaceCategories as jest.Mock).mockReturnValue({
        data: mockCategories,
        isFetching: false,
      });

      renderWithProviders(<PageFilters />);

      await waitFor(() => {
        expect(screen.getByTestId('scroll-filters')).toBeInTheDocument();
      });

      expect(screen.getByText('Restaurants')).toBeInTheDocument();
      expect(screen.getByText('Cafes')).toBeInTheDocument();
      expect(screen.queryByText('Cities')).not.toBeInTheDocument(); // Filtered out
    });

    it('should sort categories by places count', async () => {
      (usePlaceCategories as jest.Mock).mockReturnValue({
        data: mockCategories,
        isFetching: false,
      });

      renderWithProviders(<PageFilters />);

      await waitFor(() => {
        expect(mockSetSelectedCategoryId).toHaveBeenCalledWith('cat1'); // Restaurants has highest count
      });
    });

    it('should set selected category from query param', async () => {
      (nextNavigation.useSearchParams as jest.Mock).mockReturnValue({
        get: jest.fn().mockReturnValue('cat2'),
      });

      (usePlaceCategories as jest.Mock).mockReturnValue({
        data: mockCategories,
        isFetching: false,
      });

      renderWithProviders(<PageFilters />);

      await waitFor(() => {
        expect(mockSetSelectedCategoryId).toHaveBeenCalledWith('cat2');
      });
    });
  });

  describe('Experiences page', () => {
    beforeEach(() => {
      (nextNavigation.useSearchParams as jest.Mock).mockReturnValue({
        get: jest.fn().mockReturnValue(null),
      });
      (usePlaceCategories as jest.Mock).mockReturnValue({
        data: null,
        isFetching: false,
      });
    });

    it.each(['/', '/experiences'])('should render experience filters on %s', async (pathname) => {
      (nextNavigation.usePathname as jest.Mock).mockReturnValue(pathname);

      renderWithProviders(<PageFilters />);

      await waitFor(() => {
        expect(screen.getByText('All Experiences')).toBeInTheDocument();
      });

      expect(screen.getByText('Reserved Experiences')).toBeInTheDocument();
      expect(screen.getByText('Saved')).toBeInTheDocument();
      expect(screen.getByText('Hosting')).toBeInTheDocument();
    });

    it("should set 'all' as selected category when no query param", async () => {
      (nextNavigation.usePathname as jest.Mock).mockReturnValue('/experiences');

      renderWithProviders(<PageFilters />);

      await waitFor(() => {
        expect(mockSetSelectedCategoryId).toHaveBeenCalledWith('all');
      });
    });

    it('should set selected category from query param', async () => {
      (nextNavigation.usePathname as jest.Mock).mockReturnValue('/experiences');
      (nextNavigation.useSearchParams as jest.Mock).mockReturnValue({
        get: jest.fn().mockReturnValue('saved'),
      });

      renderWithProviders(<PageFilters />);

      await waitFor(() => {
        expect(mockSetSelectedCategoryId).toHaveBeenCalledWith('saved');
      });
    });
  });

  describe('Communities page', () => {
    beforeEach(() => {
      (nextNavigation.usePathname as jest.Mock).mockReturnValue('/communities');
      (nextNavigation.useSearchParams as jest.Mock).mockReturnValue({
        get: jest.fn().mockReturnValue(null),
      });
      (usePlaceCategories as jest.Mock).mockReturnValue({
        data: null,
        isFetching: false,
      });
    });

    it('should render community filters', async () => {
      renderWithProviders(<PageFilters />);

      await waitFor(() => {
        expect(screen.getByText('My Communities')).toBeInTheDocument();
      });

      expect(screen.getByText('Recommended')).toBeInTheDocument();
      expect(screen.getByText('Posts')).toBeInTheDocument();
    });
  });
});
