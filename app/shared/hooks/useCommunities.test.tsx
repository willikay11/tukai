import React from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';

import * as communityService from '@/services/community';

import {
  useCommunityPostPhotos,
  useCommunityPosts,
  useCreateCommunity,
  useCreateCommunityPhotos,
  useGetCommunities,
  useJoinCommunity,
  useJoinCommunityViaInvite,
} from './useCommunities';

jest.mock('@/services/community', () => ({
  getCommunities: jest.fn(),
  joinCommunity: jest.fn(),
  joinCommunityWithToken: jest.fn(),
  fetchCommunityPosts: jest.fn(),
  fetchCommunityPostPhotos: jest.fn(),
  createCommunity: jest.fn(),
  createCommunityPhotos: jest.fn(),
}));

const mockCommunityService = communityService as jest.Mocked<typeof communityService>;

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

const mockCommunity = {
  id: 'comm-123',
  name: 'Hiking Enthusiasts',
  description: 'A community for hiking lovers',
  membersCount: 100,
  postsCount: 45,
};

describe('Communities Hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useGetCommunities', () => {
    it('fetches communities with default parameters', async () => {
      const mockData = { data: { results: [mockCommunity], count: 1 } };
      mockCommunityService.getCommunities.mockResolvedValue(mockData);

      const { result } = renderHook(
        () =>
          useGetCommunities({
            page: 1,
            enabled: true,
          }),
        { wrapper: createWrapper() },
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockData);
      expect(mockCommunityService.getCommunities).toHaveBeenCalledWith(
        undefined,
        1,
        12,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
      );
    });

    it('does not fetch when enabled is false', () => {
      mockCommunityService.getCommunities.mockResolvedValue({
        data: { results: [], count: 0 },
      });

      renderHook(
        () =>
          useGetCommunities({
            page: 1,
            enabled: false,
          }),
        { wrapper: createWrapper() },
      );

      expect(mockCommunityService.getCommunities).not.toHaveBeenCalled();
    });

    it('fetches communities with category filter', async () => {
      const mockData = { data: { results: [mockCommunity], count: 1 } };
      mockCommunityService.getCommunities.mockResolvedValue(mockData);

      renderHook(
        () =>
          useGetCommunities({
            page: 1,
            enabled: true,
            category: ['cat-1', 'cat-2'],
          }),
        { wrapper: createWrapper() },
      );

      await waitFor(() => {
        expect(mockCommunityService.getCommunities).toHaveBeenCalledWith(
          ['cat-1', 'cat-2'],
          1,
          12,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
        );
      });
    });

    it('fetches communities with search query', async () => {
      const mockData = { data: { results: [mockCommunity], count: 1 } };
      mockCommunityService.getCommunities.mockResolvedValue(mockData);

      renderHook(
        () =>
          useGetCommunities({
            page: 1,
            enabled: true,
            search: 'hiking',
          }),
        { wrapper: createWrapper() },
      );

      await waitFor(() => {
        expect(mockCommunityService.getCommunities).toHaveBeenCalledWith(
          undefined,
          1,
          12,
          'hiking',
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
        );
      });
    });

    it('fetches recommended communities', async () => {
      const mockData = { data: { results: [mockCommunity], count: 1 } };
      mockCommunityService.getCommunities.mockResolvedValue(mockData);

      renderHook(
        () =>
          useGetCommunities({
            page: 1,
            enabled: true,
            recommendedCommunities: true,
          }),
        { wrapper: createWrapper() },
      );

      await waitFor(() => {
        expect(mockCommunityService.getCommunities).toHaveBeenCalledWith(
          undefined,
          1,
          12,
          undefined,
          undefined,
          true,
          undefined,
          undefined,
          undefined,
        );
      });
    });

    it('fetches popular communities', async () => {
      const mockData = { data: { results: [mockCommunity], count: 1 } };
      mockCommunityService.getCommunities.mockResolvedValue(mockData);

      renderHook(
        () =>
          useGetCommunities({
            page: 1,
            enabled: true,
            popularCommunities: true,
          }),
        { wrapper: createWrapper() },
      );

      await waitFor(() => {
        expect(mockCommunityService.getCommunities).toHaveBeenCalledWith(
          undefined,
          1,
          12,
          undefined,
          undefined,
          undefined,
          true,
          undefined,
          undefined,
        );
      });
    });

    it('fetches communities by creator', async () => {
      const mockData = { data: { results: [mockCommunity], count: 1 } };
      mockCommunityService.getCommunities.mockResolvedValue(mockData);

      renderHook(
        () =>
          useGetCommunities({
            page: 1,
            enabled: true,
            createdBy: 'user-456',
          }),
        { wrapper: createWrapper() },
      );

      await waitFor(() => {
        expect(mockCommunityService.getCommunities).toHaveBeenCalledWith(
          undefined,
          1,
          12,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          'user-456',
        );
      });
    });

    it('fetches user following communities', async () => {
      const mockData = { data: { results: [mockCommunity], count: 1 } };
      mockCommunityService.getCommunities.mockResolvedValue(mockData);

      renderHook(
        () =>
          useGetCommunities({
            page: 1,
            enabled: true,
            following: true,
          }),
        { wrapper: createWrapper() },
      );

      await waitFor(() => {
        expect(mockCommunityService.getCommunities).toHaveBeenCalledWith(
          undefined,
          1,
          12,
          undefined,
          undefined,
          undefined,
          undefined,
          true,
          undefined,
        );
      });
    });

    it('fetches with multiple filters combined', async () => {
      const mockData = { data: { results: [mockCommunity], count: 1 } };
      mockCommunityService.getCommunities.mockResolvedValue(mockData);

      renderHook(
        () =>
          useGetCommunities({
            page: 2,
            enabled: true,
            category: ['cat-1'],
            search: 'adventure',
            createdBy: 'user-123',
          }),
        { wrapper: createWrapper() },
      );

      await waitFor(() => {
        expect(mockCommunityService.getCommunities).toHaveBeenCalledWith(
          ['cat-1'],
          2,
          12,
          'adventure',
          undefined,
          undefined,
          undefined,
          undefined,
          'user-123',
        );
      });
    });
  });

  describe('useJoinCommunity', () => {
    it('joins community successfully', async () => {
      mockCommunityService.joinCommunity.mockResolvedValue({ success: true });

      const { result } = renderHook(() => useJoinCommunity(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.mutate('comm-123');
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockCommunityService.joinCommunity).toHaveBeenCalledWith('comm-123');
    });

    it('handles error when joining community', async () => {
      mockCommunityService.joinCommunity.mockRejectedValue(new Error('Already member'));

      const { result } = renderHook(() => useJoinCommunity(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.mutate('comm-123');
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });
  });

  describe('useJoinCommunityViaInvite', () => {
    it('joins community with invite token', async () => {
      mockCommunityService.joinCommunityWithToken.mockResolvedValue({ success: true });

      const { result } = renderHook(() => useJoinCommunityViaInvite(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.mutate({ communityId: 'comm-123', token: 'invite-token-abc' });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockCommunityService.joinCommunityWithToken).toHaveBeenCalledWith(
        'comm-123',
        'invite-token-abc',
      );
    });

    it('handles invalid invite token', async () => {
      mockCommunityService.joinCommunityWithToken.mockRejectedValue(new Error('Invalid token'));

      const { result } = renderHook(() => useJoinCommunityViaInvite(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.mutate({ communityId: 'comm-123', token: 'invalid' });
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });
  });

  describe('useCommunityPosts', () => {
    it('fetches community posts when enabled', async () => {
      const mockPosts = { data: { results: [], count: 0 } };
      mockCommunityService.fetchCommunityPosts.mockResolvedValue(mockPosts);

      const params = { page: 1, page_size: 10, author: undefined, is_liked: false };

      const { result } = renderHook(() => useCommunityPosts(params, true), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockCommunityService.fetchCommunityPosts).toHaveBeenCalledWith(params);
    });

    it('does not fetch community posts when disabled', () => {
      const mockPosts = { data: { results: [], count: 0 } };
      mockCommunityService.fetchCommunityPosts.mockResolvedValue(mockPosts);

      const params = { page: 1, page_size: 10, author: undefined, is_liked: false };

      renderHook(() => useCommunityPosts(params, false), {
        wrapper: createWrapper(),
      });

      expect(mockCommunityService.fetchCommunityPosts).not.toHaveBeenCalled();
    });

    it('fetches posts with filters', async () => {
      const mockPosts = { data: { results: [], count: 0 } };
      mockCommunityService.fetchCommunityPosts.mockResolvedValue(mockPosts);

      const params = { page: 2, page_size: 20, author: 'user-123', is_liked: true };

      renderHook(() => useCommunityPosts(params, true), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(mockCommunityService.fetchCommunityPosts).toHaveBeenCalledWith(params);
      });
    });
  });

  describe('useCommunityPostPhotos', () => {
    it('fetches community post photos when enabled', async () => {
      const mockPhotos = { data: { results: [] } };
      mockCommunityService.fetchCommunityPostPhotos.mockResolvedValue(mockPhotos);

      const { result } = renderHook(() => useCommunityPostPhotos('comm-123', true), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockCommunityService.fetchCommunityPostPhotos).toHaveBeenCalledWith('comm-123');
    });

    it('does not fetch when disabled', () => {
      mockCommunityService.fetchCommunityPostPhotos.mockResolvedValue({
        data: { results: [] },
      });

      renderHook(() => useCommunityPostPhotos('comm-123', false), {
        wrapper: createWrapper(),
      });

      expect(mockCommunityService.fetchCommunityPostPhotos).not.toHaveBeenCalled();
    });
  });

  describe('useCreateCommunity', () => {
    it('creates community successfully', async () => {
      mockCommunityService.createCommunity.mockResolvedValue({ id: 'new-comm' });

      const { result } = renderHook(() => useCreateCommunity(), {
        wrapper: createWrapper(),
      });

      const communityData = {
        name: 'New Community',
        description: 'Test community',
      };

      act(() => {
        result.current.mutate(communityData as any);
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockCommunityService.createCommunity).toHaveBeenCalledWith(communityData);
    });

    it('handles error when creating community', async () => {
      mockCommunityService.createCommunity.mockRejectedValue(new Error('Validation failed'));

      const { result } = renderHook(() => useCreateCommunity(), {
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

  describe('useCreateCommunityPhotos', () => {
    it('uploads community photos successfully', async () => {
      mockCommunityService.createCommunityPhotos.mockResolvedValue({ success: true });

      const { result } = renderHook(() => useCreateCommunityPhotos(), {
        wrapper: createWrapper(),
      });

      const file = new File(['photo'], 'photo.jpg', { type: 'image/jpeg' });

      act(() => {
        result.current.mutate({
          communityId: 'comm-123',
          photos: [file],
        });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockCommunityService.createCommunityPhotos).toHaveBeenCalledWith('comm-123', [file]);
    });

    it('handles error when uploading photos', async () => {
      mockCommunityService.createCommunityPhotos.mockRejectedValue(new Error('Upload failed'));

      const { result } = renderHook(() => useCreateCommunityPhotos(), {
        wrapper: createWrapper(),
      });

      const file = new File(['photo'], 'photo.jpg', { type: 'image/jpeg' });

      act(() => {
        result.current.mutate({
          communityId: 'comm-123',
          photos: [file],
        });
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });

    it('uploads multiple photos', async () => {
      mockCommunityService.createCommunityPhotos.mockResolvedValue({ success: true });

      const { result } = renderHook(() => useCreateCommunityPhotos(), {
        wrapper: createWrapper(),
      });

      const files = [
        new File(['photo1'], 'photo1.jpg', { type: 'image/jpeg' }),
        new File(['photo2'], 'photo2.jpg', { type: 'image/jpeg' }),
        new File(['photo3'], 'photo3.jpg', { type: 'image/jpeg' }),
      ];

      act(() => {
        result.current.mutate({
          communityId: 'comm-123',
          photos: files,
        });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockCommunityService.createCommunityPhotos).toHaveBeenCalledWith('comm-123', files);
    });
  });
});

// Regression: the query key omitted the boolean flags, so a popular/recommended
// /following query shared a cache entry with a plain one and they served each
// other's results.
describe('useGetCommunities cache separation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const popularCommunity = { ...mockCommunity, id: 'popular-1', name: 'Popular Crew' };
  const plainCommunity = { ...mockCommunity, id: 'plain-1', name: 'Plain Crew' };

  it('does not let a popular query serve a plain query its results', async () => {
    mockCommunityService.getCommunities.mockImplementation((...args: any[]) => {
      const isPopular = args[6] === true;
      return Promise.resolve({
        data: { results: [isPopular ? popularCommunity : plainCommunity], count: 1 },
      } as any);
    });

    // One client, so both hooks share a cache — the whole point of the test
    const wrapper = createWrapper();

    const popular = renderHook(
      () => useGetCommunities({ page: 1, enabled: true, popularCommunities: true }),
      { wrapper },
    );
    const plain = renderHook(() => useGetCommunities({ page: 1, enabled: true }), { wrapper });

    await waitFor(() => expect(popular.result.current.isSuccess).toBe(true));
    await waitFor(() => expect(plain.result.current.isSuccess).toBe(true));

    expect(popular.result.current.data?.data?.results[0].id).toBe('popular-1');
    expect(plain.result.current.data?.data?.results[0].id).toBe('plain-1');
    expect(mockCommunityService.getCommunities).toHaveBeenCalledTimes(2);
  });

  it('keeps recommended and following queries distinct too', async () => {
    mockCommunityService.getCommunities.mockResolvedValue({
      data: { results: [mockCommunity], count: 1 },
    } as any);

    const wrapper = createWrapper();

    const recommended = renderHook(
      () => useGetCommunities({ page: 1, enabled: true, recommendedCommunities: true }),
      { wrapper },
    );
    const following = renderHook(
      () => useGetCommunities({ page: 1, enabled: true, following: true }),
      { wrapper },
    );

    await waitFor(() => expect(recommended.result.current.isSuccess).toBe(true));
    await waitFor(() => expect(following.result.current.isSuccess).toBe(true));

    expect(mockCommunityService.getCommunities).toHaveBeenCalledTimes(2);
  });
});
