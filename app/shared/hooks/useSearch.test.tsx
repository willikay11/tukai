import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';

import * as searchService from '@/services/search';

import { useSearch } from './useSearch';

jest.mock('@/services/search');

const mockSearchService = searchService as jest.Mocked<typeof searchService>;

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) =>
    QueryClientProvider({ client: queryClient, children });
};

const mockSearchResults = {
  data: {
    results: [
      {
        id: 'result-1',
        type: 'experience',
        data: {
          id: 'exp-1',
          title: 'Hiking Adventure',
          location: { formattedAddress: 'Nairobi, Kenya' },
          photos: [],
        },
      },
      {
        id: 'result-2',
        type: 'place',
        data: {
          id: 'place-1',
          title: 'Coffee Shop',
          location: { formattedAddress: 'Nairobi, Kenya' },
          photos: [],
        },
      },
    ],
  },
};

describe('useSearch', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('search with query', () => {
    it('does not fetch when query is empty', () => {
      mockSearchService.searchPlaces.mockResolvedValue(mockSearchResults);

      renderHook(() => useSearch(), {
        wrapper: createWrapper() as any,
      });

      expect(mockSearchService.searchPlaces).not.toHaveBeenCalled();
    });

    it('does not fetch when query is undefined', () => {
      mockSearchService.searchPlaces.mockResolvedValue(mockSearchResults);

      renderHook(() => useSearch(undefined), {
        wrapper: createWrapper() as any,
      });

      expect(mockSearchService.searchPlaces).not.toHaveBeenCalled();
    });

    it('fetches search results when query is provided', async () => {
      mockSearchService.searchPlaces.mockResolvedValue(mockSearchResults);

      const { result } = renderHook(() => useSearch('hiking'), {
        wrapper: createWrapper() as any,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual(mockSearchResults);
      expect(mockSearchService.searchPlaces).toHaveBeenCalledWith('hiking', undefined, 5);
    });

    it('fetches with query and category ID', async () => {
      mockSearchService.searchPlaces.mockResolvedValue(mockSearchResults);

      renderHook(() => useSearch('beach', 'cat-123'), {
        wrapper: createWrapper() as any,
      });

      await waitFor(() => {
        expect(mockSearchService.searchPlaces).toHaveBeenCalledWith('beach', 'cat-123', 5);
      });
    });

    it('uses correct limit for search results', async () => {
      mockSearchService.searchPlaces.mockResolvedValue(mockSearchResults);

      renderHook(() => useSearch('mountain'), {
        wrapper: createWrapper() as any,
      });

      await waitFor(() => {
        expect(mockSearchService.searchPlaces).toHaveBeenCalledWith('mountain', undefined, 5);
      });
    });
  });

  describe('search results', () => {
    it('returns search results data', async () => {
      mockSearchService.searchPlaces.mockResolvedValue(mockSearchResults);

      const { result } = renderHook(() => useSearch('adventure'), {
        wrapper: createWrapper() as any,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockSearchResults);
    });

    it('handles empty search results', async () => {
      const emptyResults = { data: { results: [] } };
      mockSearchService.searchPlaces.mockResolvedValue(emptyResults);

      const { result } = renderHook(() => useSearch('nonexistent'), {
        wrapper: createWrapper() as any,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(emptyResults);
    });

    it('returns mixed experience and place results', async () => {
      mockSearchService.searchPlaces.mockResolvedValue(mockSearchResults);

      const { result } = renderHook(() => useSearch('activity'), {
        wrapper: createWrapper() as any,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      const results = result.current.data?.data?.results || [];
      expect(results).toHaveLength(2);
      expect(results[0].type).toBe('experience');
      expect(results[1].type).toBe('place');
    });
  });

  describe('query key and caching', () => {
    it('uses correct query key with query and categoryId', async () => {
      mockSearchService.searchPlaces.mockResolvedValue(mockSearchResults);

      const { rerender } = renderHook(
        ({ query, categoryId }: { query?: string; categoryId?: string }) =>
          useSearch(query, categoryId),
        {
          wrapper: createWrapper() as any,
          initialProps: { query: 'hiking', categoryId: undefined },
        },
      );

      await waitFor(() => {
        expect(mockSearchService.searchPlaces).toHaveBeenCalledWith('hiking', undefined, 5);
      });

      // Change query - should trigger new fetch
      rerender({ query: 'beach', categoryId: undefined });

      await waitFor(() => {
        expect(mockSearchService.searchPlaces).toHaveBeenCalledWith('beach', undefined, 5);
      });
    });

    it('refetches when category ID changes', async () => {
      mockSearchService.searchPlaces.mockResolvedValue(mockSearchResults);

      const { rerender } = renderHook(
        ({ query, categoryId }: { query?: string; categoryId?: string }) =>
          useSearch(query, categoryId),
        {
          wrapper: createWrapper() as any,
          initialProps: { query: 'activity', categoryId: 'cat-1' },
        },
      );

      await waitFor(() => {
        expect(mockSearchService.searchPlaces).toHaveBeenCalledWith('activity', 'cat-1', 5);
      });

      rerender({ query: 'activity', categoryId: 'cat-2' });

      await waitFor(() => {
        expect(mockSearchService.searchPlaces).toHaveBeenCalledWith('activity', 'cat-2', 5);
      });
    });
  });

  describe('error handling', () => {
    it('handles search error', async () => {
      mockSearchService.searchPlaces.mockRejectedValue(new Error('Search failed'));

      const { result } = renderHook(() => useSearch('test'), {
        wrapper: createWrapper() as any,
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
    });

    it('shows loading state', async () => {
      mockSearchService.searchPlaces.mockResolvedValue(mockSearchResults);

      const { result } = renderHook(() => useSearch('pending'), {
        wrapper: createWrapper() as any,
      });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe('enabled state', () => {
    it('is disabled when no query', () => {
      mockSearchService.searchPlaces.mockResolvedValue(mockSearchResults);

      const { result } = renderHook(() => useSearch(''), {
        wrapper: createWrapper() as any,
      });

      // Should not be fetching if query is empty string
      expect(mockSearchService.searchPlaces).not.toHaveBeenCalled();
    });

    it('is enabled when query exists', async () => {
      mockSearchService.searchPlaces.mockResolvedValue(mockSearchResults);

      renderHook(() => useSearch('active'), {
        wrapper: createWrapper() as any,
      });

      await waitFor(() => {
        expect(mockSearchService.searchPlaces).toHaveBeenCalled();
      });
    });

    it('transitions from disabled to enabled', async () => {
      mockSearchService.searchPlaces.mockResolvedValue(mockSearchResults);

      const { rerender } = renderHook(({ query }: { query?: string }) => useSearch(query), {
        wrapper: createWrapper() as any,
        initialProps: { query: undefined },
      });

      expect(mockSearchService.searchPlaces).not.toHaveBeenCalled();

      rerender({ query: 'now-active' });

      await waitFor(() => {
        expect(mockSearchService.searchPlaces).toHaveBeenCalledWith('now-active', undefined, 5);
      });
    });

    it('transitions from enabled to disabled', async () => {
      mockSearchService.searchPlaces.mockResolvedValue(mockSearchResults);

      const { rerender } = renderHook(({ query }: { query?: string }) => useSearch(query), {
        wrapper: createWrapper() as any,
        initialProps: { query: 'search term' },
      });

      await waitFor(() => {
        expect(mockSearchService.searchPlaces).toHaveBeenCalledTimes(1);
      });

      rerender({ query: undefined });

      // Should not trigger new fetch
      expect(mockSearchService.searchPlaces).toHaveBeenCalledTimes(1);
    });
  });

  describe('with category filter', () => {
    it('searches with specific category', async () => {
      mockSearchService.searchPlaces.mockResolvedValue(mockSearchResults);

      renderHook(() => useSearch('adventure', 'outdoor'), {
        wrapper: createWrapper() as any,
      });

      await waitFor(() => {
        expect(mockSearchService.searchPlaces).toHaveBeenCalledWith('adventure', 'outdoor', 5);
      });
    });

    it('clears category filter', async () => {
      mockSearchService.searchPlaces.mockResolvedValue(mockSearchResults);

      const { rerender } = renderHook(
        ({ query, categoryId }: { query?: string; categoryId?: string }) =>
          useSearch(query, categoryId),
        {
          wrapper: createWrapper() as any,
          initialProps: { query: 'adventure', categoryId: 'outdoor' },
        },
      );

      await waitFor(() => {
        expect(mockSearchService.searchPlaces).toHaveBeenCalledWith('adventure', 'outdoor', 5);
      });

      rerender({ query: 'adventure', categoryId: undefined });

      await waitFor(() => {
        expect(mockSearchService.searchPlaces).toHaveBeenCalledWith('adventure', undefined, 5);
      });
    });
  });
});
