import React from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';

import * as experienceService from '@/services/experience';

import {
  useAddGuestToExperience,
  useBookmarkExperience,
  useCreateExperience,
  useCreateExperienceTicket,
  useDeleteExperienceTicket,
  useExperiences,
  useFetchSingleExperience,
  usePublishExperience,
  usePurchaseExperienceTicket,
  useUpdateExperience,
  useUpdateExperienceTicket,
} from './useExperiences';

jest.mock('@/services/experience');

const mockExperienceService = experienceService as jest.Mocked<typeof experienceService>;

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

const mockExperience = {
  id: 'exp-123',
  title: 'Hiking Adventure',
  description: 'Amazing hike',
  startDate: '2024-05-01',
  endDate: '2024-05-01',
  priceStartsFrom: { amount: 100, currency: 'USD' },
  photos: [],
  totalReviews: 5,
  averageRating: 4.5,
  categories: [],
  isBookmarked: false,
  isSoldOut: false,
  isPublic: true,
  status: 'PUBLISHED' as const,
};

const mockExperiencesResponse = {
  data: {
    count: 2,
    results: [mockExperience],
  },
};

describe('Experience Hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useExperiences', () => {
    it('returns data on successful fetch', async () => {
      mockExperienceService.fetchExperiences.mockResolvedValue(mockExperiencesResponse);

      const { result } = renderHook(
        () =>
          useExperiences(
            {
              page: 1,
              page_size: 10,
            },
            true,
          ),
        { wrapper: createWrapper() },
      );

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual(mockExperiencesResponse);
    });

    it('does not fetch when enabled is false', () => {
      mockExperienceService.fetchExperiences.mockResolvedValue(mockExperiencesResponse);

      renderHook(
        () =>
          useExperiences(
            {
              page: 1,
              page_size: 10,
            },
            false,
          ),
        { wrapper: createWrapper() },
      );

      expect(mockExperienceService.fetchExperiences).not.toHaveBeenCalled();
    });

    it('handles errors gracefully', async () => {
      mockExperienceService.fetchExperiences.mockRejectedValue(new Error('API error'));

      const { result } = renderHook(
        () =>
          useExperiences(
            {
              page: 1,
              page_size: 10,
            },
            true,
          ),
        { wrapper: createWrapper() },
      );

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
    });
  });

  describe('useFetchSingleExperience', () => {
    it('returns single experience data', async () => {
      mockExperienceService.fetchExperience.mockResolvedValue({ data: mockExperience });

      const { result } = renderHook(() => useFetchSingleExperience('exp-123'), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual({ data: mockExperience });
    });

    it('does not fetch when id is empty', () => {
      mockExperienceService.fetchExperience.mockResolvedValue({ data: mockExperience });

      renderHook(() => useFetchSingleExperience(''), { wrapper: createWrapper() });

      expect(mockExperienceService.fetchExperience).not.toHaveBeenCalled();
    });

    it('passes withAuth parameter correctly', async () => {
      mockExperienceService.fetchExperience.mockResolvedValue({ data: mockExperience });

      renderHook(() => useFetchSingleExperience('exp-123', true), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(mockExperienceService.fetchExperience).toHaveBeenCalledWith('exp-123', true);
      });
    });
  });

  describe('usePurchaseExperienceTicket', () => {
    it('purchases ticket successfully', async () => {
      const mockPurchaseData = {
        experienceId: 'exp-123',
        ticketId: 'ticket-123',
        email: 'user@example.com',
        phone: '+254712345678',
      } as any;

      mockExperienceService.purchaseExperienceTicket.mockResolvedValue({ success: true });

      const { result } = renderHook(() => usePurchaseExperienceTicket(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.mutate(mockPurchaseData);
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockExperienceService.purchaseExperienceTicket).toHaveBeenCalledWith(mockPurchaseData);
    });

    it('handles purchase errors', async () => {
      mockExperienceService.purchaseExperienceTicket.mockRejectedValue(new Error('Payment failed'));

      const { result } = renderHook(() => usePurchaseExperienceTicket(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.mutate({} as any);
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });
  });

  describe('useBookmarkExperience', () => {
    it('bookmarks experience successfully', async () => {
      mockExperienceService.bookmarkExperience.mockResolvedValue({ bookmarked: true });

      const { result } = renderHook(() => useBookmarkExperience(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.mutate('exp-123');
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockExperienceService.bookmarkExperience).toHaveBeenCalledWith('exp-123');
    });
  });

  describe('useCreateExperience', () => {
    it('creates experience successfully', async () => {
      const createData = {
        title: 'New Experience',
        description: 'Description',
      } as any;

      mockExperienceService.createExperience.mockResolvedValue({ id: 'exp-new' });

      const { result } = renderHook(() => useCreateExperience(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.mutate(createData);
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockExperienceService.createExperience).toHaveBeenCalledWith(createData);
    });
  });

  describe('useUpdateExperience', () => {
    it('updates experience successfully', async () => {
      const updateData = {
        title: 'Updated Experience',
      } as any;

      mockExperienceService.updateExperience.mockResolvedValue({ id: 'exp-123' });

      const { result } = renderHook(() => useUpdateExperience('exp-123'), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.mutate(updateData);
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockExperienceService.updateExperience).toHaveBeenCalledWith('exp-123', updateData);
    });
  });

  describe('useCreateExperienceTicket', () => {
    it('creates ticket successfully', async () => {
      const ticketData = {
        slot: '2024-05-01',
        quantity: 2,
      } as any;

      mockExperienceService.createExperienceTicket.mockResolvedValue({ id: 'ticket-123' });

      const { result } = renderHook(() => useCreateExperienceTicket('exp-123'), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.mutate(ticketData);
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockExperienceService.createExperienceTicket).toHaveBeenCalledWith(
        'exp-123',
        ticketData,
      );
    });
  });

  describe('useUpdateExperienceTicket', () => {
    it('updates ticket successfully', async () => {
      const ticketData = {
        quantity: 5,
      } as any;

      mockExperienceService.updateExperienceTicket.mockResolvedValue({ id: 'ticket-123' });

      const { result } = renderHook(() => useUpdateExperienceTicket('exp-123', 'ticket-123'), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.mutate(ticketData);
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockExperienceService.updateExperienceTicket).toHaveBeenCalledWith(
        'exp-123',
        'ticket-123',
        ticketData,
      );
    });
  });

  describe('useDeleteExperienceTicket', () => {
    it('deletes ticket successfully', async () => {
      mockExperienceService.deleteExperienceTicket.mockResolvedValue({ success: true });

      const { result } = renderHook(() => useDeleteExperienceTicket('exp-123', 'ticket-123'), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.mutate();
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockExperienceService.deleteExperienceTicket).toHaveBeenCalledWith(
        'exp-123',
        'ticket-123',
      );
    });
  });

  describe('useAddGuestToExperience', () => {
    it('adds guest successfully', async () => {
      mockExperienceService.addGuestToExperience.mockResolvedValue({ success: true });

      const { result } = renderHook(() => useAddGuestToExperience('exp-123'), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.mutate('guest@example.com');
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockExperienceService.addGuestToExperience).toHaveBeenCalledWith(
        'exp-123',
        'guest@example.com',
      );
    });
  });

  describe('usePublishExperience', () => {
    it('publishes experience successfully', async () => {
      mockExperienceService.publishExperience.mockResolvedValue({ published: true });

      const { result } = renderHook(() => usePublishExperience('exp-123'), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.mutate();
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockExperienceService.publishExperience).toHaveBeenCalledWith('exp-123');
    });
  });
});
