import React from 'react';

import { useSession } from 'next-auth/react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';

import { useCreateExperienceFlow } from './useCreateExperienceFlow';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
  useSearchParams: jest.fn(),
}));

// Mock NextAuth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

// Mock custom hooks
jest.mock('@/app/shared/hooks/useCommunities', () => ({
  useGetCommunities: jest.fn(() => ({
    data: { data: [] },
    isFetching: false,
  })),
}));

jest.mock('@/app/shared/hooks', () => ({
  useFetchSingleExperience: jest.fn(() => ({
    data: null,
    isLoading: false,
  })),
  useToast: jest.fn(),
}));

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

describe('useCreateExperienceFlow', () => {
  const mockRouter = {
    push: jest.fn(),
    replace: jest.fn(),
  };

  const mockSearchParams = new URLSearchParams();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (usePathname as jest.Mock).mockReturnValue('/experiences/create');
    (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { id: 'user-123' } },
      status: 'authenticated',
    });
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useCreateExperienceFlow(), {
      wrapper: createWrapper(),
    });

    expect(result.current.activeStep).toBe('community');
    expect(result.current.experienceId).toBeNull();
    expect(result.current.hasUpdatedDates).toBe(false);
    expect(result.current.itineraryConfig).toBeNull();
    expect(result.current.invitedMembers).toEqual([]);
    expect(result.current.invitedCommunities).toEqual([]);
  });

  it('should have handlers object with required methods', () => {
    const { result } = renderHook(() => useCreateExperienceFlow(), {
      wrapper: createWrapper(),
    });

    expect(result.current.handlers).toBeDefined();
    expect(typeof result.current.handlers.handleStepChange).toBe('function');
    expect(typeof result.current.handlers.handleExperienceCreated).toBe('function');
    expect(typeof result.current.handlers.handleDatesUpdatedSuccess).toBe('function');
    expect(typeof result.current.handlers.handleItineraryCustomise).toBe('function');
    expect(typeof result.current.handlers.handleInvitesChange).toBe('function');
  });

  it('should change active step when handleStepChange is called', () => {
    const { result } = renderHook(() => useCreateExperienceFlow(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.handlers.handleStepChange('dates');
    });

    expect(result.current.activeStep).toBe('dates');
  });

  it('should update experienceId when handleExperienceCreated is called', () => {
    const { result } = renderHook(() => useCreateExperienceFlow(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.handlers.handleExperienceCreated('exp-123');
    });

    expect(result.current.experienceId).toBe('exp-123');
  });

  it('should set hasUpdatedDates to true when handleDatesUpdatedSuccess is called', () => {
    const { result } = renderHook(() => useCreateExperienceFlow(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.handlers.handleDatesUpdatedSuccess();
    });

    expect(result.current.hasUpdatedDates).toBe(true);
  });

  it('should update itineraryConfig when handleItineraryCustomise is called', () => {
    const { result } = renderHook(() => useCreateExperienceFlow(), {
      wrapper: createWrapper(),
    });

    const mockConfig = {
      slots: [{ date: '2024-04-01', capacity: 10 }],
    };

    act(() => {
      result.current.handlers.handleItineraryCustomise(mockConfig);
    });

    expect(result.current.itineraryConfig).toEqual(mockConfig);
  });

  it('should update invites when handleInvitesChange is called', () => {
    const { result } = renderHook(() => useCreateExperienceFlow(), {
      wrapper: createWrapper(),
    });

    const mockMembers = [{ id: 'user-1', name: 'John', email: 'john@example.com' }];
    const mockCommunities = [
      {
        id: 'com-1',
        title: 'Community 1',
        description: 'Test',
        categories: [],
        isPublic: true,
        status: 'active',
      },
    ] as any;

    act(() => {
      result.current.handlers.handleInvitesChange(mockMembers, mockCommunities);
    });

    expect(result.current.invitedMembers).toEqual(mockMembers);
    expect(result.current.invitedCommunities).toEqual(mockCommunities);
  });

  it('should return loading state for experience', () => {
    const { result } = renderHook(() => useCreateExperienceFlow(), {
      wrapper: createWrapper(),
    });

    expect(typeof result.current.isLoadingExperience).toBe('boolean');
  });

  it('should have handlers for all experience flow steps', () => {
    const { result } = renderHook(() => useCreateExperienceFlow(), {
      wrapper: createWrapper(),
    });

    expect(typeof result.current.handlers.handleStepChange).toBe('function');
    expect(typeof result.current.handlers.handleExperienceCreated).toBe('function');
    expect(typeof result.current.handlers.handleDatesUpdatedSuccess).toBe('function');
  });
});
