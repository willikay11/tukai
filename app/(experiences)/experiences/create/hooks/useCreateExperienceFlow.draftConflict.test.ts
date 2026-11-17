import React from 'react';

import { useSession } from 'next-auth/react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';

import { createExperience } from '@/services/experience';

import { useCreateExperienceFlow } from './useCreateExperienceFlow';

jest.mock('uuid', () => ({ v4: () => 'test-uuid-v4', v1: () => 'test-uuid-v1' }));
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
  useSearchParams: jest.fn(),
}));
jest.mock('next-auth/react', () => ({ useSession: jest.fn() }));
jest.mock('@/app/shared/hooks/useCommunities', () => ({
  useGetCommunities: jest.fn(() => ({ data: { data: { results: [] } }, isFetching: false })),
}));

const mockToast = jest.fn();
jest.mock('@/app/shared/hooks/useToast', () => ({ useToast: () => ({ toast: mockToast }) }));

// Every API call is a stub; the test sets what creating an experience answers
jest.mock('@/services/experience');

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const Wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
  return Wrapper;
};

const fillInSingleDayExperience = (result: {
  current: ReturnType<typeof useCreateExperienceFlow>;
}) => {
  act(() => {
    result.current.updateFormData({ date: '2026-07-05', startTime: '08:00', endTime: '10:00' });
    result.current.updateAboutFormData({
      title: 'Sunrise hike',
      description: 'Up Ngong Hills before breakfast.',
    });
  });
};

describe('useCreateExperienceFlow, when the host already has a draft', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: jest.fn(), replace: jest.fn() });
    (usePathname as jest.Mock).mockReturnValue('/experiences/create');
    (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams());
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { id: 'user-123' } },
      status: 'authenticated',
    });
  });

  // DEV-354 / DEV-487: the API answers a second draft with a 409 naming the first
  it('opens the existing draft instead of failing', async () => {
    (createExperience as jest.Mock).mockRejectedValue({
      status: 409,
      success: false,
      message: 'draft_exists',
      errors: [{ code: 'draft_exists', detail: 'draft-123', attr: 'draft_id' }],
    });
    const { result } = renderHook(() => useCreateExperienceFlow({ syncToUrl: false }), {
      wrapper: createWrapper(),
    });
    fillInSingleDayExperience(result);

    let saved: boolean | undefined;
    await act(async () => {
      saved = await result.current.handlers.handleSaveAbout();
    });

    expect(saved).toBe(false);
    expect(result.current.experienceId).toBe('draft-123');
    expect(result.current.activeStep).toBe('dates-type');
    expect(result.current.apiError).toBeNull();
    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'You already have a draft' }),
    );
  });

  it('still reports any other failure', async () => {
    (createExperience as jest.Mock).mockRejectedValue({
      status: 400,
      success: false,
      message: 'Title is required.',
      errors: [{ code: 'required', detail: 'Title is required.', attr: 'title' }],
    });
    const { result } = renderHook(() => useCreateExperienceFlow({ syncToUrl: false }), {
      wrapper: createWrapper(),
    });
    fillInSingleDayExperience(result);

    await act(async () => {
      await result.current.handlers.handleSaveAbout();
    });

    expect(result.current.experienceId).toBeNull();
    expect(result.current.apiError).toBe('Title is required.');
  });
});
