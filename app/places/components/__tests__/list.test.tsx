import React from 'react';

import { render, screen, waitFor } from '@testing-library/react';

import { useLocation } from '@/context/LocationContext';
import { useSelectedCategory } from '@/context/SelectedCategoryContext';
import { Status } from '@/enums/status';
import { usePlaces } from '@/hooks/places';
import { Place } from '@/types/place';

import ListPlaces from '../list';

// Mock dependencies
jest.mock('@/context/LocationContext');
jest.mock('@/context/SelectedCategoryContext');
jest.mock('@/hooks/places');
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
  return MockComponent;
});
jest.mock('@/components/ui/noData', () => {
  function MockNoData({ message }: { message: string }) {
    return <div>{message}</div>;
  }
  MockNoData.displayName = 'MockNoData';
  return MockNoData;
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
    global.IntersectionObserver = jest.fn().mockImplementation(() => ({
      observe: jest.fn(),
      disconnect: jest.fn(),
      unobserve: jest.fn(),
    })) as unknown as typeof IntersectionObserver;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render placeholders initially', () => {
    mockUsePlaces.mockReturnValue(createMockUsePlacesReturn([], 0, true));

    render(<ListPlaces />);

    expect(screen.getAllByText('Loading...').length).toBeGreaterThan(0);
  });

  it('should render places after loading', async () => {
    const mockPlaces = Array.from({ length: 12 }, (_, i) => createMockPlace(`place-${i}`));
    mockUsePlaces.mockReturnValue(createMockUsePlacesReturn(mockPlaces, 12));

    render(<ListPlaces />);

    await waitFor(() => {
      expect(screen.getByText('Place place-0')).toBeInTheDocument();
      expect(screen.getByText('Place place-11')).toBeInTheDocument();
    });
  });

  it('should reset to page 1 when category changes', async () => {
    const mockPlaces = Array.from({ length: 12 }, (_, i) => createMockPlace(`place-${i}`));
    let currentPage = 1;
    const disconnectMock = jest.fn();
    const observeMock = jest.fn();

    global.IntersectionObserver = jest.fn().mockImplementation(() => ({
      observe: observeMock,
      disconnect: disconnectMock,
      unobserve: jest.fn(),
    })) as unknown as typeof IntersectionObserver;

    mockUsePlaces.mockImplementation(({ page }: Parameters<typeof usePlaces>[0]) => {
      currentPage = page;
      return createMockUsePlacesReturn(mockPlaces, 24);
    });

    const { rerender } = render(<ListPlaces />);

    await waitFor(() => {
      expect(screen.getByText('Place place-0')).toBeInTheDocument();
      expect(observeMock).toHaveBeenCalled();
    });

    // Reset mock call counts before category change
    disconnectMock.mockClear();

    // Set loading state when category changes
    mockUsePlaces.mockImplementation(({ page }: Parameters<typeof usePlaces>[0]) => {
      currentPage = page;
      return createMockUsePlacesReturn(mockPlaces, 24, true);
    });

    setupMocks({ selectedCategoryId: 'cat-2' });
    rerender(<ListPlaces />);

    // Verify placeholders are shown during reset
    expect(screen.getAllByText('Loading...').length).toBeGreaterThan(0);

    // Then set data back to loaded state
    mockUsePlaces.mockImplementation(({ page }: Parameters<typeof usePlaces>[0]) => {
      currentPage = page;
      return createMockUsePlacesReturn(mockPlaces, 24);
    });
    rerender(<ListPlaces />);

    await waitFor(() => {
      expect(currentPage).toBe(1);
      // Verify that observer.disconnect() was called when category changed
      expect(disconnectMock).toHaveBeenCalled();
    });
  });

  it('should show NoData when no places found', async () => {
    mockUsePlaces.mockReturnValue(createMockUsePlacesReturn([], 0));

    render(<ListPlaces />);

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

    render(<ListPlaces />);

    // Verify placeholders are rendered
    expect(screen.getAllByText('Loading...').length).toBeGreaterThan(0);

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

    const { unmount } = render(<ListPlaces />);

    await waitFor(() => {
      expect(observeMock).toHaveBeenCalled();
    });

    unmount();

    expect(disconnectMock).toHaveBeenCalled();
  });

  it('should load initial page successfully', async () => {
    const mockPlacesPage1 = Array.from({ length: 12 }, (_, i) => createMockPlace(`page1-${i}`));

    mockUsePlaces.mockReturnValue(createMockUsePlacesReturn(mockPlacesPage1, 24));

    render(<ListPlaces />);

    await waitFor(() => {
      expect(screen.getByText('Place page1-0')).toBeInTheDocument();
      expect(screen.getByText('Place page1-11')).toBeInTheDocument();
    });

    expect(screen.queryByText('Place page2-0')).not.toBeInTheDocument();
  });
});
