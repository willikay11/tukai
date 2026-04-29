import React from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen, waitFor } from '@testing-library/react';

import { useLocation } from '@/context/LocationContext';
import { useSelectedCategory } from '@/context/SelectedCategoryContext';
import { Status } from '@/enums/status';
import { usePlaces } from '@/app/shared/hooks/usePlaces';
import { Place } from '@/types/place';

import { ListPlaces } from '../list';

// Mock dependencies
jest.mock('@/context/LocationContext');
jest.mock('@/context/SelectedCategoryContext');
jest.mock('@/app/shared/hooks/usePlaces');
jest.mock('../place', () => {
  const MockComponent = React.forwardRef<HTMLDivElement, { place: Place }>(function MockSinglePlace(
    { place },
    ref,
  ) {
    return (
      <div ref={ref} data-testid={`place-${place.id}`}>
        {place.title}
      </div>
    );
  });
  return { SinglePlace: MockComponent };
});
jest.mock('@/components/ui/noData', () => {
  function MockNoData({ message }: { message: string }) {
    return <div>{message}</div>;
  }
  MockNoData.displayName = 'MockNoData';
  return { NoData: MockNoData };
});
jest.mock('next/link', () => {
  function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>;
  }
  MockLink.displayName = 'MockLink';
  return MockLink;
});
jest.mock('framer-motion', () => ({
  motion: {
    div: React.forwardRef<HTMLDivElement, React.HTMLProps<HTMLDivElement>>(function MotionDiv(
      { children, ...props },
      ref,
    ) {
      return (
        <div ref={ref} {...props}>
          {children}
        </div>
      );
    }),
  },
}));

const mockUsePlaces = usePlaces as jest.MockedFunction<typeof usePlaces>;
const mockUseLocation = useLocation as jest.MockedFunction<typeof useLocation>;
const mockUseSelectedCategory = useSelectedCategory as jest.MockedFunction<
  typeof useSelectedCategory
>;

const createMockPlace = (id: string): Place => ({
  id,
  title: `Place ${id}`,
  description: 'Test description',
  location: {
    id: '1',
    name: 'Test Location',
    pointLat: 0,
    pointLong: 0,
    point: { type: 'Point' as const, coordinates: [0, 0] },
    formattedAddress: 'Test Address',
    street: 'Test Street',
    city: 'Test City',
    state: 'Test State',
    country: 'Test Country',
  },
  dateCreated: '2024-01-01',
  photos: [],
  totalReviews: 0,
  averageRating: 0,
  isBookmarked: false,
  status: Status.Published,
  categories: [],
});

const createMockUsePlacesReturn = (
  places: Place[],
  count: number,
  isLoading = false,
): ReturnType<typeof usePlaces> =>
  ({
    data: isLoading
      ? undefined
      : {
          status: 200,
          success: true,
          data: {
            results: places,
            count,
          },
        },
    isLoading,
    error: null,
    refetch: jest.fn(),
  }) as unknown as ReturnType<typeof usePlaces>;

describe('ListPlaces', () => {
  const createWrapper = () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    const Wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    Wrapper.displayName = 'TestWrapper';
    return Wrapper;
  };

  const setupMocks = (overrides = {}) => {
    mockUseLocation.mockReturnValue({
      lat: 0,
      lng: 0,
      status: 'granted',
      requestLocation: jest.fn(),
      setLocation: jest.fn(),
    });
    mockUseSelectedCategory.mockReturnValue({
      selectedCategoryId: 'cat-1',
      selectedCitySearchId: undefined,
      setSelectedCategoryId: jest.fn(),
      setSelectedCitySearchId: jest.fn(),
      ...overrides,
    });
  };

  beforeEach(() => {
    setupMocks();
    jest.useFakeTimers();
    global.IntersectionObserver = jest.fn().mockImplementation(() => ({
      observe: jest.fn(),
      disconnect: jest.fn(),
      unobserve: jest.fn(),
    })) as unknown as typeof IntersectionObserver;
  });

  afterEach(() => {
    jest.clearAllMocks();
    act(() => {
      jest.runAllTimers();
    });
    jest.useRealTimers();
  });

  it('should render placeholders initially', () => {
    mockUsePlaces.mockReturnValue(createMockUsePlacesReturn([], 0, true));

    render(<ListPlaces />, { wrapper: createWrapper() });

    expect(screen.getAllByText('Loading...').length).toBeGreaterThan(0);
  });

  it('should render places after loading', async () => {
    const mockPlaces = Array.from({ length: 12 }, (_, i) => createMockPlace(`place-${i}`));
    mockUsePlaces.mockReturnValue(createMockUsePlacesReturn(mockPlaces, 12));

    render(<ListPlaces />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Place place-0')).toBeInTheDocument();
      expect(screen.getByText('Place place-11')).toBeInTheDocument();
    });
  });

  it('should reset to page 1 when category changes', async () => {
    const mockPlaces = Array.from({ length: 12 }, (_, i) => createMockPlace(`place-${i}`));
    let currentPage = 1;
    let queryEnabled = true;
    const disconnectMock = jest.fn();
    const observeMock = jest.fn();

    global.IntersectionObserver = jest.fn().mockImplementation(() => ({
      observe: observeMock,
      disconnect: disconnectMock,
      unobserve: jest.fn(),
    })) as unknown as typeof IntersectionObserver;

    mockUsePlaces.mockImplementation(({ page, enabled }: Parameters<typeof usePlaces>[0]) => {
      currentPage = page;
      queryEnabled = enabled ?? true;
      return createMockUsePlacesReturn(mockPlaces, 24);
    });

    const { rerender } = render(<ListPlaces />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Place place-0')).toBeInTheDocument();
      expect(observeMock).toHaveBeenCalled();
    });

    // Reset mock call counts before category change
    disconnectMock.mockClear();

    // Change category - query should be disabled temporarily
    mockUsePlaces.mockImplementation(({ page, enabled }: Parameters<typeof usePlaces>[0]) => {
      currentPage = page;
      queryEnabled = enabled ?? true;
      // When query is disabled, return loading state
      return createMockUsePlacesReturn(mockPlaces, 24, !enabled);
    });

    setupMocks({ selectedCategoryId: 'cat-2' });
    rerender(<ListPlaces />);

    // Verify query was disabled and page reset
    await waitFor(() => {
      expect(queryEnabled).toBe(false);
      expect(currentPage).toBe(1);
    });

    // Run timers to re-enable query within act
    await act(async () => {
      jest.runAllTimers();
    });

    // Rerender with query enabled
    mockUsePlaces.mockImplementation(({ page, enabled }: Parameters<typeof usePlaces>[0]) => {
      currentPage = page;
      queryEnabled = enabled ?? true;
      return createMockUsePlacesReturn(mockPlaces, 24);
    });
    rerender(<ListPlaces />);

    await waitFor(() => {
      expect(queryEnabled).toBe(true);
      expect(disconnectMock).toHaveBeenCalled();
    });
  });

  it('should show NoData when no places found', async () => {
    mockUsePlaces.mockReturnValue(createMockUsePlacesReturn([], 0));

    render(<ListPlaces />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('No places found')).toBeInTheDocument();
    });
  });

  it('should not attach ref to placeholder elements', () => {
    const observeMock = jest.fn();

    global.IntersectionObserver = jest.fn().mockImplementation(() => ({
      observe: observeMock,
      disconnect: jest.fn(),
      unobserve: jest.fn(),
    })) as unknown as typeof IntersectionObserver;

    mockUsePlaces.mockReturnValue(createMockUsePlacesReturn([], 0, true));

    render(<ListPlaces />, { wrapper: createWrapper() });

    // Verify placeholders are rendered
    expect(screen.getAllByText('Loading...').length).toBe(12); // ITEMS_PER_PAGE constant

    // Verify that IntersectionObserver was never created (no ref attached to placeholders)
    expect(observeMock).not.toHaveBeenCalled();
    expect(global.IntersectionObserver).not.toHaveBeenCalled();
  });

  it('should disconnect observer on unmount', async () => {
    const disconnectMock = jest.fn();
    const observeMock = jest.fn();

    global.IntersectionObserver = jest.fn().mockImplementation(() => ({
      observe: observeMock,
      disconnect: disconnectMock,
      unobserve: jest.fn(),
    })) as unknown as typeof IntersectionObserver;

    const mockPlaces = Array.from({ length: 12 }, (_, i) => createMockPlace(`place-${i}`));
    mockUsePlaces.mockReturnValue(createMockUsePlacesReturn(mockPlaces, 24));

    const { unmount } = render(<ListPlaces />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(observeMock).toHaveBeenCalled();
    });

    unmount();

    expect(disconnectMock).toHaveBeenCalled();
  });

  it('should load initial page successfully', async () => {
    const mockPlacesPage1 = Array.from({ length: 12 }, (_, i) => createMockPlace(`page1-${i}`));

    mockUsePlaces.mockReturnValue(createMockUsePlacesReturn(mockPlacesPage1, 24));

    render(<ListPlaces />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Place page1-0')).toBeInTheDocument();
      expect(screen.getByText('Place page1-11')).toBeInTheDocument();
    });

    expect(screen.queryByText('Place page2-0')).not.toBeInTheDocument();
  });

  it('should disable query when category changes and re-enable after timeout', async () => {
    const mockPlaces = Array.from({ length: 12 }, (_, i) => createMockPlace(`place-${i}`));
    let queryEnabled = true;

    mockUsePlaces.mockImplementation(({ enabled }: Parameters<typeof usePlaces>[0]) => {
      queryEnabled = enabled ?? true;
      return createMockUsePlacesReturn(mockPlaces, 12);
    });

    const { rerender } = render(<ListPlaces />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Place place-0')).toBeInTheDocument();
    });

    // Change category
    mockUsePlaces.mockImplementation(({ enabled }: Parameters<typeof usePlaces>[0]) => {
      queryEnabled = enabled ?? true;
      return createMockUsePlacesReturn(mockPlaces, 12, !enabled);
    });

    setupMocks({ selectedCategoryId: 'cat-2' });
    rerender(<ListPlaces />);

    // Query should be disabled
    await waitFor(() => {
      expect(queryEnabled).toBe(false);
    });

    // Run timeout to re-enable query within act
    await act(async () => {
      jest.runAllTimers();
    });

    mockUsePlaces.mockImplementation(({ enabled }: Parameters<typeof usePlaces>[0]) => {
      queryEnabled = enabled ?? true;
      return createMockUsePlacesReturn(mockPlaces, 12);
    });
    rerender(<ListPlaces />);

    await waitFor(() => {
      expect(queryEnabled).toBe(true);
    });
  });
});
