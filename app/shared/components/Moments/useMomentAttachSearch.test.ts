import React from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';

import * as communityService from '@/services/community';
import * as experienceService from '@/services/experience';
import * as placeService from '@/services/place';

import { useMomentAttachSearch } from './useMomentAttachSearch';

jest.mock('@/services/experience');
jest.mock('@/services/community');
jest.mock('@/services/place');

const mockExperienceService = experienceService as jest.Mocked<typeof experienceService>;
const mockCommunityService = communityService as jest.Mocked<typeof communityService>;
const mockPlaceService = placeService as jest.Mocked<typeof placeService>;

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useMomentAttachSearch', () => {
  beforeEach(() => jest.clearAllMocks());

  it('reads experiences by their date and cover photo', async () => {
    mockExperienceService.fetchExperiences.mockResolvedValue({
      status: 200,
      success: true,
      data: {
        count: 1,
        results: [
          {
            id: 'e1',
            title: 'Sunrise Hike',
            startDate: '2026-07-04T05:00:00Z',
            photos: [{ id: 'p1', isCover: true, photo: 'hike.jpg' }],
          },
        ],
      },
    });

    const { result } = renderHook(() => useMomentAttachSearch('experience', ''), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.options).toHaveLength(1));

    expect(result.current.options[0]).toMatchObject({
      id: 'e1',
      label: 'Sunrise Hike',
      thumb: 'hike.jpg',
    });
    expect(result.current.total).toBe(1);
  });

  it('reads communities by their member count', async () => {
    mockCommunityService.getCommunities.mockResolvedValue({
      status: 200,
      success: true,
      data: {
        count: 1,
        results: [
          {
            id: 'c1',
            title: 'Nairobi Runners',
            membersCount: 2140,
            photos: [],
          },
        ],
      },
    });

    const { result } = renderHook(() => useMomentAttachSearch('community', ''), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.options).toHaveLength(1));

    expect(result.current.options[0]).toMatchObject({ id: 'c1', label: 'Nairobi Runners', meta: '2140 members' });
  });

  it('flags when this reader has joined no community at all', async () => {
    mockCommunityService.getCommunities.mockResolvedValue({
      status: 200,
      success: true,
      data: { count: 0, results: [] },
    });

    const { result } = renderHook(() => useMomentAttachSearch('community', ''), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.hasNoCommunities).toBe(true));
  });

  it('reads places by their category and city', async () => {
    mockPlaceService.fetchPlaces.mockResolvedValue({
      status: 200,
      success: true,
      data: {
        count: 1,
        results: [
          {
            id: 'pl1',
            title: 'Karura Forest',
            categories: [{ id: 'cat1', name: 'Park' }],
            location: { city: 'Nairobi' },
            photos: [],
          },
        ],
      },
    });

    const { result } = renderHook(() => useMomentAttachSearch('place', ''), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.options).toHaveLength(1));

    expect(result.current.options[0]).toMatchObject({
      id: 'pl1',
      label: 'Karura Forest',
      meta: 'Park · Nairobi',
    });
  });
});
