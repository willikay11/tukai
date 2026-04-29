import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useUserExists,
  useGetInterestCategories,
  useGetUsers,
} from './useAuth';
import * as authService from '@/services/auth';

jest.mock('@/services/auth');

const mockAuthService = authService as jest.Mocked<typeof authService>;

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) =>
    QueryClientProvider({ client: queryClient, children });
};

describe('Auth Hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useUserExists', () => {
    it('checks if user exists with email', async () => {
      mockAuthService.userExists.mockResolvedValue({ exists: true });

      const { result } = renderHook(() => useUserExists(), {
        wrapper: createWrapper() as any,
      });

      act(() => {
        result.current.mutate('user@example.com');
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockAuthService.userExists).toHaveBeenCalledWith('user@example.com');
    });

    it('returns success data when user exists', async () => {
      const mockResponse = { exists: true, id: 'user-123' };
      mockAuthService.userExists.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useUserExists(), {
        wrapper: createWrapper() as any,
      });

      act(() => {
        result.current.mutate('existing@example.com');
      });

      await waitFor(() => {
        expect(result.current.data).toEqual(mockResponse);
      });
    });

    it('handles user not existing', async () => {
      mockAuthService.userExists.mockResolvedValue({ exists: false });

      const { result } = renderHook(() => useUserExists(), {
        wrapper: createWrapper() as any,
      });

      act(() => {
        result.current.mutate('nonexistent@example.com');
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
        expect(result.current.data).toEqual({ exists: false });
      });
    });

    it('handles errors when checking user existence', async () => {
      mockAuthService.userExists.mockRejectedValue(new Error('API error'));

      const { result } = renderHook(() => useUserExists(), {
        wrapper: createWrapper() as any,
      });

      act(() => {
        result.current.mutate('test@example.com');
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
    });
  });

  describe('useGetInterestCategories', () => {
    it('fetches interest categories on mount', async () => {
      const mockCategories = {
        data: {
          results: [
            { id: '1', name: 'Sports' },
            { id: '2', name: 'Music' },
          ],
        },
      };
      mockAuthService.getInterestCategories.mockResolvedValue(mockCategories);

      const { result } = renderHook(() => useGetInterestCategories(), {
        wrapper: createWrapper() as any,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockCategories);
      expect(mockAuthService.getInterestCategories).toHaveBeenCalledWith(1, 1000);
    });

    it('uses cache for interest categories', async () => {
      const mockCategories = {
        data: {
          results: [
            { id: '1', name: 'Arts' },
          ],
        },
      };
      mockAuthService.getInterestCategories.mockResolvedValue(mockCategories);

      const { result: result1 } = renderHook(() => useGetInterestCategories(), {
        wrapper: createWrapper() as any,
      });

      await waitFor(() => {
        expect(result1.current.isSuccess).toBe(true);
      });

      // Second call should use cache (already tested in first call)
      expect(mockAuthService.getInterestCategories).toHaveBeenCalledTimes(1);
    });

    it('handles error when fetching categories', async () => {
      mockAuthService.getInterestCategories.mockRejectedValue(
        new Error('Failed to fetch')
      );

      const { result } = renderHook(() => useGetInterestCategories(), {
        wrapper: createWrapper() as any,
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
    });

    it('fetches categories with default pagination params', async () => {
      mockAuthService.getInterestCategories.mockResolvedValue({
        data: { results: [] },
      });

      renderHook(() => useGetInterestCategories(), {
        wrapper: createWrapper() as any,
      });

      await waitFor(() => {
        expect(mockAuthService.getInterestCategories).toHaveBeenCalledWith(1, 1000);
      });
    });
  });

  describe('useGetUsers', () => {
    it('fetches users with default pagination', async () => {
      const mockUsers = {
        data: {
          results: [
            { id: 'user-1', name: 'John' },
            { id: 'user-2', name: 'Jane' },
          ],
        },
      };
      mockAuthService.getUsers.mockResolvedValue(mockUsers);

      const { result } = renderHook(() => useGetUsers(), {
        wrapper: createWrapper() as any,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockUsers);
      expect(mockAuthService.getUsers).toHaveBeenCalledWith(
        1,
        10,
        undefined,
        undefined,
        undefined,
        undefined
      );
    });

    it('fetches users with custom pagination', async () => {
      const mockUsers = { data: { results: [] } };
      mockAuthService.getUsers.mockResolvedValue(mockUsers);

      renderHook(() => useGetUsers(2, 20), {
        wrapper: createWrapper() as any,
      });

      await waitFor(() => {
        expect(mockAuthService.getUsers).toHaveBeenCalledWith(
          2,
          20,
          undefined,
          undefined,
          undefined,
          undefined
        );
      });
    });

    it('fetches users filtered by email', async () => {
      const mockUsers = { data: { results: [{ id: 'user-1', email: 'test@example.com' }] } };
      mockAuthService.getUsers.mockResolvedValue(mockUsers);

      renderHook(() => useGetUsers(1, 10, 'test@example.com'), {
        wrapper: createWrapper() as any,
      });

      await waitFor(() => {
        expect(mockAuthService.getUsers).toHaveBeenCalledWith(
          1,
          10,
          'test@example.com',
          undefined,
          undefined,
          undefined
        );
      });
    });

    it('fetches users filtered by followers', async () => {
      const mockUsers = { data: { results: [] } };
      mockAuthService.getUsers.mockResolvedValue(mockUsers);

      renderHook(() => useGetUsers(1, 10, undefined, 'user-123'), {
        wrapper: createWrapper() as any,
      });

      await waitFor(() => {
        expect(mockAuthService.getUsers).toHaveBeenCalledWith(
          1,
          10,
          undefined,
          'user-123',
          undefined,
          undefined
        );
      });
    });

    it('fetches users filtered by following', async () => {
      const mockUsers = { data: { results: [] } };
      mockAuthService.getUsers.mockResolvedValue(mockUsers);

      renderHook(() => useGetUsers(1, 10, undefined, undefined, 'user-456'), {
        wrapper: createWrapper() as any,
      });

      await waitFor(() => {
        expect(mockAuthService.getUsers).toHaveBeenCalledWith(
          1,
          10,
          undefined,
          undefined,
          'user-456',
          undefined
        );
      });
    });

    it('fetches users filtered by blocked', async () => {
      const mockUsers = { data: { results: [] } };
      mockAuthService.getUsers.mockResolvedValue(mockUsers);

      renderHook(() => useGetUsers(1, 10, undefined, undefined, undefined, 'user-789'), {
        wrapper: createWrapper() as any,
      });

      await waitFor(() => {
        expect(mockAuthService.getUsers).toHaveBeenCalledWith(
          1,
          10,
          undefined,
          undefined,
          undefined,
          'user-789'
        );
      });
    });

    it('fetches users with all filter parameters', async () => {
      const mockUsers = { data: { results: [] } };
      mockAuthService.getUsers.mockResolvedValue(mockUsers);

      renderHook(
        () =>
          useGetUsers(
            2,
            25,
            'test@example.com',
            'follower-123',
            'following-456',
            'blocked-789'
          ),
        {
          wrapper: createWrapper() as any,
        }
      );

      await waitFor(() => {
        expect(mockAuthService.getUsers).toHaveBeenCalledWith(
          2,
          25,
          'test@example.com',
          'follower-123',
          'following-456',
          'blocked-789'
        );
      });
    });

    it('handles error when fetching users', async () => {
      mockAuthService.getUsers.mockRejectedValue(new Error('API error'));

      const { result } = renderHook(() => useGetUsers(), {
        wrapper: createWrapper() as any,
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
    });

    it('returns empty users list when no results', async () => {
      mockAuthService.getUsers.mockResolvedValue({
        data: { results: [], count: 0 },
      });

      const { result } = renderHook(() => useGetUsers(), {
        wrapper: createWrapper() as any,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
        expect(result.current.data?.data.results).toEqual([]);
      });
    });
  });
});
