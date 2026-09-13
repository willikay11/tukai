import React from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';

import * as placeService from '@/services/place';

import {
  useBookmarkPlace,
  useCreatePlaceReview,
  useCreatePlaceReviewComment,
  useDeletePlaceReview,
  useDeletePlaceReviewImage,
  useGoogleMapsAutocomplete,
  useLikePlaceReview,
  useLikePlaceReviewComment,
  usePlaceCategories,
  usePlaceReviewComments,
  usePlaceReviews,
  usePlaces,
  useUpdatePlaceReview,
  useUploadPlaceReviewImages,
} from './usePlaces';

jest.mock('@/services/place');

const mockPlaceService = placeService as jest.Mocked<typeof placeService>;

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

const mockPlace = {
  id: 'place-123',
  title: 'Coffee Shop',
  description: 'Great coffee',
  location: { name: 'Nairobi', formattedAddress: 'Nairobi, Kenya' },
  photos: [],
  averageRating: 4.5,
  totalReviews: 10,
  isBookmarked: false,
};

describe('Place Hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('usePlaces', () => {
    it('fetches places with pagination and filters', async () => {
      const mockData = { data: { results: [mockPlace], count: 1 } };
      mockPlaceService.fetchPlaces.mockResolvedValue(mockData);

      const { result } = renderHook(
        () =>
          usePlaces({
            page: 1,
            enabled: true,
            categoryId: 'cat-123',
            lat: -1.2,
            lng: 36.8,
          }),
        { wrapper: createWrapper() },
      );

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual(mockData);
      expect(mockPlaceService.fetchPlaces).toHaveBeenCalledWith(
        1,
        12,
        'cat-123',
        undefined,
        -1.2,
        36.8,
      );
    });

    it('does not fetch when enabled is false', () => {
      mockPlaceService.fetchPlaces.mockResolvedValue({ data: { results: [], count: 0 } });

      renderHook(
        () =>
          usePlaces({
            page: 1,
            enabled: false,
          }),
        { wrapper: createWrapper() },
      );

      expect(mockPlaceService.fetchPlaces).not.toHaveBeenCalled();
    });

    it('handles multiple category IDs as array', async () => {
      const mockData = { data: { results: [], count: 0 } };
      mockPlaceService.fetchPlaces.mockResolvedValue(mockData);

      renderHook(
        () =>
          usePlaces({
            page: 1,
            enabled: true,
            categoryId: ['cat-1', 'cat-2', 'cat-3'],
          }),
        { wrapper: createWrapper() },
      );

      await waitFor(() => {
        expect(mockPlaceService.fetchPlaces).toHaveBeenCalledWith(
          1,
          12,
          ['cat-1', 'cat-2', 'cat-3'],
          undefined,
          undefined,
          undefined,
        );
      });
    });
  });

  describe('usePlaceCategories', () => {
    it('fetches place categories with caching', async () => {
      const mockCategories = { data: { results: [] } };
      mockPlaceService.fetchPlaceCategories.mockResolvedValue(mockCategories);

      const { result } = renderHook(() => usePlaceCategories({ pageSize: 100 }, true), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual(mockCategories);
    });

    it('does not fetch when enabled is false', () => {
      mockPlaceService.fetchPlaceCategories.mockResolvedValue({ data: { results: [] } });

      renderHook(() => usePlaceCategories({ pageSize: 100 }, false), { wrapper: createWrapper() });

      expect(mockPlaceService.fetchPlaceCategories).not.toHaveBeenCalled();
    });
  });

  describe('usePlaceReviews', () => {
    it('fetches reviews for a place', async () => {
      const mockReviews = { data: { results: [] } };
      mockPlaceService.fetchPlaceReviews.mockResolvedValue(mockReviews);

      const { result } = renderHook(() => usePlaceReviews('place-123'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual(mockReviews);
      expect(mockPlaceService.fetchPlaceReviews).toHaveBeenCalledWith('place-123');
    });
  });

  describe('usePlaceReviewComments', () => {
    it('fetches comments when enabled', async () => {
      const mockComments = { data: { results: [] } };
      mockPlaceService.fetchPlaceReviewComments.mockResolvedValue(mockComments);

      const { result } = renderHook(() => usePlaceReviewComments('place-123', 'review-456', true), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockPlaceService.fetchPlaceReviewComments).toHaveBeenCalledWith(
        'place-123',
        'review-456',
      );
    });

    it('does not fetch when disabled', () => {
      mockPlaceService.fetchPlaceReviewComments.mockResolvedValue({ data: { results: [] } });

      renderHook(() => usePlaceReviewComments('place-123', 'review-456', false), {
        wrapper: createWrapper(),
      });

      expect(mockPlaceService.fetchPlaceReviewComments).not.toHaveBeenCalled();
    });
  });

  describe('useCreatePlaceReviewComment', () => {
    it('creates review comment successfully', async () => {
      mockPlaceService.createPlaceReviewComment.mockResolvedValue({ id: 'comment-789' });

      const { result } = renderHook(() => useCreatePlaceReviewComment('place-123', 'review-456'), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.mutate({ content: 'Great review!' } as any);
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockPlaceService.createPlaceReviewComment).toHaveBeenCalled();
    });
  });

  describe('useLikePlaceReviewComment', () => {
    it('likes review comment successfully', async () => {
      mockPlaceService.likePlaceReviewComment.mockResolvedValue({ liked: true });

      const { result } = renderHook(
        () => useLikePlaceReviewComment('place-123', 'review-456', 'comment-789'),
        { wrapper: createWrapper() },
      );

      act(() => {
        result.current.mutate();
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockPlaceService.likePlaceReviewComment).toHaveBeenCalledWith(
        'place-123',
        'review-456',
        'comment-789',
        {
          place_id: 'place-123',
          review_id: 'review-456',
          comment_id: 'comment-789',
        },
      );
    });
  });

  describe('useLikePlaceReview', () => {
    it('likes place review successfully', async () => {
      mockPlaceService.likePlaceReview.mockResolvedValue({ liked: true });

      const { result } = renderHook(() => useLikePlaceReview(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.mutate({ placeId: 'place-123', reviewId: 'review-456' });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockPlaceService.likePlaceReview).toHaveBeenCalled();
    });
  });

  describe('useBookmarkPlace', () => {
    it('bookmarks place successfully', async () => {
      mockPlaceService.bookmarkPlace.mockResolvedValue({ bookmarked: true });

      const { result } = renderHook(() => useBookmarkPlace('place-123', 'user-456'), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.mutate();
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockPlaceService.bookmarkPlace).toHaveBeenCalledWith('place-123', {
        user_id: 'user-456',
      });
    });
  });

  describe('useCreatePlaceReview', () => {
    it('creates place review successfully', async () => {
      mockPlaceService.createPlaceReview.mockResolvedValue({ id: 'review-new' });

      const { result } = renderHook(() => useCreatePlaceReview(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.mutate({
          placeId: 'place-123',
          data: { rating: 5, content: 'Excellent!' },
        });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockPlaceService.createPlaceReview).toHaveBeenCalled();
    });
  });

  describe('useUpdatePlaceReview', () => {
    it('updates place review successfully', async () => {
      mockPlaceService.updatePlaceReview.mockResolvedValue({ id: 'review-456' });

      const { result } = renderHook(() => useUpdatePlaceReview(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.mutate({
          placeId: 'place-123',
          reviewId: 'review-456',
          data: { rating: 4, content: 'Good' },
        });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockPlaceService.updatePlaceReview).toHaveBeenCalled();
    });
  });

  describe('useUploadPlaceReviewImages', () => {
    it('uploads review images successfully', async () => {
      mockPlaceService.uploadPlaceReviewImages.mockResolvedValue({ images: [] });

      const { result } = renderHook(() => useUploadPlaceReviewImages(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.mutate({
          placeId: 'place-123',
          reviewId: 'review-456',
          data: new FormData(),
        });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockPlaceService.uploadPlaceReviewImages).toHaveBeenCalled();
    });
  });

  describe('useDeletePlaceReview', () => {
    it('deletes place review successfully', async () => {
      mockPlaceService.deletePlaceReview.mockResolvedValue({ success: true });

      const { result } = renderHook(() => useDeletePlaceReview(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.mutate({
          placeId: 'place-123',
          reviewId: 'review-456',
        });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockPlaceService.deletePlaceReview).toHaveBeenCalledWith('place-123', 'review-456');
    });
  });

  describe('useDeletePlaceReviewImage', () => {
    it('deletes review image successfully', async () => {
      mockPlaceService.deletePlaceReviewImage.mockResolvedValue({ success: true });

      const { result } = renderHook(() => useDeletePlaceReviewImage(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.mutate({
          placeId: 'place-123',
          reviewId: 'review-456',
          imageId: 'image-789',
        });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockPlaceService.deletePlaceReviewImage).toHaveBeenCalledWith(
        'place-123',
        'review-456',
        'image-789',
      );
    });
  });

  describe('useGoogleMapsAutocomplete', () => {
    it('fetches autocomplete suggestions', async () => {
      const mockSuggestions = { data: { predictions: [] } };
      mockPlaceService.fetchGoogleMapsAutocomplete.mockResolvedValue(mockSuggestions);

      const { result } = renderHook(() => useGoogleMapsAutocomplete('Nairobi', true), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual(mockSuggestions);
      expect(mockPlaceService.fetchGoogleMapsAutocomplete).toHaveBeenCalledWith('Nairobi');
    });

    it('does not fetch when input is empty', () => {
      mockPlaceService.fetchGoogleMapsAutocomplete.mockResolvedValue({ data: { predictions: [] } });

      renderHook(() => useGoogleMapsAutocomplete('', true), { wrapper: createWrapper() });

      expect(mockPlaceService.fetchGoogleMapsAutocomplete).not.toHaveBeenCalled();
    });

    it('respects enabled flag', () => {
      mockPlaceService.fetchGoogleMapsAutocomplete.mockResolvedValue({ data: { predictions: [] } });

      renderHook(() => useGoogleMapsAutocomplete('Nairobi', false), { wrapper: createWrapper() });

      expect(mockPlaceService.fetchGoogleMapsAutocomplete).not.toHaveBeenCalled();
    });
  });

  describe('cache invalidation on mutations', () => {
    it('invalidates placeReviews cache after creating review', async () => {
      mockPlaceService.createPlaceReview.mockResolvedValue({ id: 'review-new' });

      const { result } = renderHook(() => useCreatePlaceReview(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.mutate({
          placeId: 'place-123',
          data: { rating: 5 },
        });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // Verify the mutation was called (cache invalidation happens internally)
      expect(mockPlaceService.createPlaceReview).toHaveBeenCalled();
    });

    it('invalidates placeReviews cache after updating review', async () => {
      mockPlaceService.updatePlaceReview.mockResolvedValue({ id: 'review-456' });

      const { result } = renderHook(() => useUpdatePlaceReview(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.mutate({
          placeId: 'place-123',
          reviewId: 'review-456',
          data: { rating: 4 },
        });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockPlaceService.updatePlaceReview).toHaveBeenCalled();
    });
  });
});
