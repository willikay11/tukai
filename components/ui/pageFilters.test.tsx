import React from 'react';

import * as nextNavigation from 'next/navigation';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { usePlaceCategories } from '@/app/shared/hooks/usePlaces';

import { PageFilters } from './pageFilters';

// Mock dependencies
const mockReplace = jest.fn();
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
  useSearchParams: jest.fn(),
  useRouter: () => ({ replace: mockReplace }),
}));

jest.mock('@/app/shared/hooks/usePlaces', () => ({
  usePlaceCategories: jest.fn(),
}));

jest.mock('@/app/shared/components/Filters/CategoryChipRow', () => ({
  CategoryChipRow: ({
    chips,
    value,
    onChange,
  }: {
    chips: { value: string; label: string }[];
    value: string;
    onChange: (value: string) => void;
  }) => (
    <div data-testid="category-chip-row" data-value={value}>
      {chips.map((chip) => (
        <button
          key={chip.value}
          data-testid={`chip-${chip.value}`}
          onClick={() => onChange(chip.value)}
        >
          {chip.label}
        </button>
      ))}
    </div>
  ),
}));

jest.mock('@/app/shared/components/Cards/Skeletons', () => ({
  PillsSkeleton: () => <div data-testid="pills-skeleton">Loading...</div>,
}));

const mockSetSelectedCategoryId = jest.fn();
let mockSelectedCategoryId: string | undefined;
jest.mock('@/context/SelectedCategoryContext', () => ({
  useSelectedCategory: () => ({
    selectedCategoryId: mockSelectedCategoryId,
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
    mockSelectedCategoryId = undefined;

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
      '/control-center/experiences/456',
      '/moments',
      '/moments?momentId=abc',
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

    // Regression: /moments matched no branch of the effect, so isLoading never
    // cleared and the pill skeleton sat at the top of the page permanently
    it('should not leave a pill skeleton on /moments', () => {
      (nextNavigation.usePathname as jest.Mock).mockReturnValue('/moments');
      (nextNavigation.useSearchParams as jest.Mock).mockReturnValue({
        get: jest.fn().mockReturnValue(null),
      });

      renderWithProviders(<PageFilters />);
      expect(screen.queryByTestId('pills-skeleton')).not.toBeInTheDocument();
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

    it('should render an All chip followed by the categories, without cities', async () => {
      (usePlaceCategories as jest.Mock).mockReturnValue({
        data: mockCategories,
        isFetching: false,
      });

      renderWithProviders(<PageFilters />);

      await waitFor(() => {
        expect(screen.getByTestId('category-chip-row')).toBeInTheDocument();
      });

      expect(screen.getByText('All')).toBeInTheDocument();
      expect(screen.getByText('Restaurants')).toBeInTheDocument();
      expect(screen.getByText('Cafes')).toBeInTheDocument();
      expect(screen.queryByText('Cities')).not.toBeInTheDocument(); // Filtered out
    });

    it('should order interest categories first, then by places count', async () => {
      (usePlaceCategories as jest.Mock).mockReturnValue({
        data: {
          data: {
            results: [
              { id: 'food1', name: 'Food', placesCount: 500, group: 'food' },
              { id: 'int1', name: 'Gallery', placesCount: 10, group: 'interests' },
              { id: 'int2', name: 'Garden', placesCount: 40, group: 'interests' },
            ],
          },
        },
        isFetching: false,
      });

      renderWithProviders(<PageFilters />);

      await waitFor(() => {
        expect(screen.getByTestId('category-chip-row')).toBeInTheDocument();
      });

      const labels = screen.getByTestId('category-chip-row').textContent;
      expect(labels).toBe('AllGardenGalleryFood');
    });

    it('defaults to All when the URL names no category', async () => {
      (usePlaceCategories as jest.Mock).mockReturnValue({
        data: mockCategories,
        isFetching: false,
      });

      renderWithProviders(<PageFilters />);

      await waitFor(() => {
        expect(mockSetSelectedCategoryId).toHaveBeenCalledWith('all');
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

    it('picking a chip selects it and writes it to the URL', async () => {
      (nextNavigation.useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams());
      (usePlaceCategories as jest.Mock).mockReturnValue({
        data: mockCategories,
        isFetching: false,
      });

      renderWithProviders(<PageFilters />);

      await waitFor(() => {
        expect(screen.getByTestId('chip-cat2')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('chip-cat2'));

      expect(mockSetSelectedCategoryId).toHaveBeenCalledWith('cat2');
      expect(mockReplace).toHaveBeenCalledWith('/places?category=cat2', { scroll: true });
    });

    it('marks the selected category on the row', async () => {
      mockSelectedCategoryId = 'cat1';
      (usePlaceCategories as jest.Mock).mockReturnValue({
        data: mockCategories,
        isFetching: false,
      });

      renderWithProviders(<PageFilters />);

      await waitFor(() => {
        expect(screen.getByTestId('category-chip-row')).toHaveAttribute('data-value', 'cat1');
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

    // The experience tabs moved to ExperiencesPageContent - PageFilters is
    // deliberately absent on these paths now.
    it.each(['/', '/experiences'])('renders nothing on %s', async (pathname) => {
      (nextNavigation.usePathname as jest.Mock).mockReturnValue(pathname);

      const { container } = renderWithProviders(<PageFilters />);

      await waitFor(() => {
        expect(container).toBeEmptyDOMElement();
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

    // The My Communities / Recommended toggle moved onto the page itself, so
    // PageFilters is deliberately absent here - same as on /experiences.
    it('renders nothing on /communities', async () => {
      const { container } = renderWithProviders(<PageFilters />);

      await waitFor(() => {
        expect(container).toBeEmptyDOMElement();
      });
    });
  });
});
