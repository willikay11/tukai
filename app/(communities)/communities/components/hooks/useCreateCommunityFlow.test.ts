import React from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';

import { useCreateCommunityFlow } from './useCreateCommunityFlow';

// Mock React Hook Form
jest.mock('react-hook-form', () => ({
  useForm: jest.fn(() => ({
    control: {},
    handleSubmit: jest.fn((cb) => jest.fn(() => cb({}))),
    formState: { isValid: true, isDirty: false, errors: {} },
    setError: jest.fn(),
    clearErrors: jest.fn(),
    setValue: jest.fn(),
    reset: jest.fn(),
    watch: jest.fn(),
  })),
}));

// Mock Zod resolver
jest.mock('@hookform/resolvers/zod', () => ({
  zodResolver: jest.fn((schema) => jest.fn()),
}));

// Mock custom hooks
jest.mock('@/app/shared/hooks/useAuth', () => ({
  useGetInterestCategories: jest.fn(() => ({
    data: [
      { id: 'cat-1', name: 'Hiking', icon: 'hiking' },
      { id: 'cat-2', name: 'Food', icon: 'food' },
    ],
  })),
  useGetUsers: jest.fn(() => ({
    data: [
      { id: 'user-1', firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
      { id: 'user-2', firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com' },
    ],
    isFetching: false,
  })),
}));

jest.mock('@/app/shared/hooks/useCommunities', () => ({
  useGetCommunities: jest.fn(() => ({
    data: {
      data: {
        results: [
          { id: 'com-1', title: 'Community 1', members: 10 },
          { id: 'com-2', title: 'Community 2', members: 20 },
        ],
      },
    },
    isFetching: false,
  })),
  useCreateCommunity: jest.fn(() => ({
    mutate: jest.fn((data, callbacks) => {
      // Simulate success
      callbacks.onSuccess({ data: { id: 'new-com-123' } });
    }),
    isPending: false,
  })),
}));

jest.mock('@/app/shared/hooks/usePlaces', () => ({
  useGoogleMapsAutocomplete: jest.fn(() => ({
    data: {
      data: [
        { place_id: 'place-1', description: 'Nairobi, Kenya' },
        { place_id: 'place-2', description: 'Nairobi City Center' },
      ],
    },
    isFetching: false,
  })),
}));

jest.mock('@/app/shared/hooks/useToast', () => ({
  toast: jest.fn(),
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

describe('useCreateCommunityFlow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useCreateCommunityFlow(), {
      wrapper: createWrapper(),
    });

    expect(result.current.selectedCategories).toEqual([]);
    expect(result.current.uploadedFiles).toEqual([]);
    expect(result.current.cityInput).toBe('');
    expect(result.current.showCitySuggestions).toBe(false);
    expect(result.current.invitedMembers).toEqual([]);
    expect(result.current.memberSearchQuery).toBe('');
    expect(result.current.invitedCommunities).toEqual([]);
    expect(result.current.isSuccessDialogOpen).toBe(false);
    expect(result.current.createdCommunityId).toBeNull();
  });

  it('should have form instance', () => {
    const { result } = renderHook(() => useCreateCommunityFlow(), {
      wrapper: createWrapper(),
    });

    expect(result.current.form).toBeDefined();
    expect(result.current.form.control).toBeDefined();
    expect(result.current.form.handleSubmit).toBeDefined();
  });

  it('should toggle category selection', () => {
    const { result } = renderHook(() => useCreateCommunityFlow(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.handlers.toggleCategory('cat-1');
    });

    expect(result.current.selectedCategories).toContain('cat-1');

    act(() => {
      result.current.handlers.toggleCategory('cat-1');
    });

    expect(result.current.selectedCategories).not.toContain('cat-1');
  });

  it('should add multiple categories', () => {
    const { result } = renderHook(() => useCreateCommunityFlow(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.handlers.toggleCategory('cat-1');
      result.current.handlers.toggleCategory('cat-2');
    });

    expect(result.current.selectedCategories).toEqual(['cat-1', 'cat-2']);
  });

  it('should provide available categories', () => {
    const { result } = renderHook(() => useCreateCommunityFlow(), {
      wrapper: createWrapper(),
    });

    expect(result.current.categories).toBeDefined();
    expect(result.current.categories.length).toBeGreaterThan(0);
  });

  it('should provide available communities', () => {
    const { result } = renderHook(() => useCreateCommunityFlow(), {
      wrapper: createWrapper(),
    });

    expect(result.current.availableCommunities).toBeDefined();
    expect(Array.isArray(result.current.availableCommunities)).toBe(true);
  });

  it('should filter member search results', () => {
    const { result } = renderHook(() => useCreateCommunityFlow(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.setMemberSearchQuery('John');
    });

    waitFor(() => {
      expect(result.current.memberSearchResults.length).toBeGreaterThan(0);
    });
  });

  it('should update uploaded files', () => {
    const { result } = renderHook(() => useCreateCommunityFlow(), {
      wrapper: createWrapper(),
    });
    const mockFile = new File(['content'], 'image.png', { type: 'image/png' });

    act(() => {
      result.current.setUploadedFiles([mockFile]);
    });

    expect(result.current.uploadedFiles).toContain(mockFile);
  });

  it('should update city input', () => {
    const { result } = renderHook(() => useCreateCommunityFlow(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.setCityInput('Nairobi');
    });

    expect(result.current.cityInput).toBe('Nairobi');
  });

  it('should show city suggestions when input changes', () => {
    const { result } = renderHook(() => useCreateCommunityFlow(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.setShowCitySuggestions(true);
    });

    expect(result.current.showCitySuggestions).toBe(true);
  });

  it('should add invited members', () => {
    const { result } = renderHook(() => useCreateCommunityFlow(), {
      wrapper: createWrapper(),
    });

    const newMember = { id: 'user-1', name: 'John Doe', email: 'john@example.com' };

    act(() => {
      result.current.setInvitedMembers([newMember]);
    });

    expect(result.current.invitedMembers).toContain(newMember);
  });

  it('should add invited communities', () => {
    const { result } = renderHook(() => useCreateCommunityFlow(), {
      wrapper: createWrapper(),
    });

    const newCommunity = { id: 'com-1', title: 'Community 1', members: 10 };

    act(() => {
      result.current.setInvitedCommunities([newCommunity]);
    });

    expect(result.current.invitedCommunities).toContain(newCommunity);
  });

  it('should provide loading states', () => {
    const { result } = renderHook(() => useCreateCommunityFlow(), {
      wrapper: createWrapper(),
    });

    expect(typeof result.current.isFetchingCommunities).toBe('boolean');
    expect(typeof result.current.isSearchingUsers).toBe('boolean');
    expect(typeof result.current.isFetchingGooglePlaces).toBe('boolean');
    expect(typeof result.current.isCreatingCommunity).toBe('boolean');
  });

  it('should provide Google Places suggestions', () => {
    const { result } = renderHook(() => useCreateCommunityFlow(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.setCityInput('Nairobi');
    });

    expect(Array.isArray(result.current.googlePlaces)).toBe(true);
  });

  it('should handle successful form submission', async () => {
    const { result } = renderHook(() => useCreateCommunityFlow(), {
      wrapper: createWrapper(),
    });

    const values = {
      communityName: 'Test Community',
      description: 'A test community',
      city: 'place-1',
      selectedCategories: ['cat-1'],
      visibility: 'public' as const,
      uploadedFiles: [new File([''], 'test.png')],
    };

    act(() => {
      result.current.handlers.onSubmit(values);
    });

    await waitFor(() => {
      expect(result.current.createdCommunityId).toBe('new-com-123');
      expect(result.current.isSuccessDialogOpen).toBe(true);
    });
  });

  it('should reset form after successful creation', async () => {
    const { result } = renderHook(() => useCreateCommunityFlow(), {
      wrapper: createWrapper(),
    });

    const values = {
      communityName: 'Test Community',
      description: 'A test community',
      city: 'place-1',
      selectedCategories: ['cat-1'],
      visibility: 'public' as const,
      uploadedFiles: [new File([''], 'test.png')],
    };

    act(() => {
      result.current.handlers.onSubmit(values);
    });

    await waitFor(() => {
      expect(result.current.selectedCategories).toEqual([]);
      expect(result.current.cityInput).toBe('');
      expect(result.current.uploadedFiles).toEqual([]);
      expect(result.current.invitedMembers).toEqual([]);
      expect(result.current.invitedCommunities).toEqual([]);
    });
  });

  it('should have handlers object', () => {
    const { result } = renderHook(() => useCreateCommunityFlow(), {
      wrapper: createWrapper(),
    });

    expect(result.current.handlers).toBeDefined();
    expect(typeof result.current.handlers.toggleCategory).toBe('function');
    expect(typeof result.current.handlers.onSubmit).toBe('function');
  });
});
