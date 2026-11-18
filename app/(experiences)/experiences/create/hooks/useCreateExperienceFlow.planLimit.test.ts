import React from 'react';

import { useSession } from 'next-auth/react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';

import { publishExperience } from '@/services/experience';

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

// Stands in for the "See plans" button; real one covered in usePlanLimitAction.test
const mockPlanAction = { type: 'see-plans' };
jest.mock('@/app/shared/hooks/usePlanLimitAction', () => ({
  usePlanLimitAction: () => (error: { errors?: { code: string }[] }) =>
    error?.errors?.[0]?.code.startsWith('plan_limit_') ? mockPlanAction : undefined,
}));

// Every API call is a stub; the test sets what publishing answers
jest.mock('@/services/experience');

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const Wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
  return Wrapper;
};

const LIVE_LIMIT =
  'Your Basic plan allows 3 live experiences at a time. Unpublish one or upgrade your plan to publish this one.';

describe('useCreateExperienceFlow, when the host’s plan stops them', () => {
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

  // DEV-351: publishing past the plan's live-experience limit is a 400
  it('shows the API’s reason and offers the hosting plans', async () => {
    (publishExperience as jest.Mock).mockRejectedValue({
      status: 400,
      success: false,
      message: LIVE_LIMIT,
      errors: [{ code: 'plan_limit_live_experiences', detail: LIVE_LIMIT, attr: null }],
    });
    const { result } = renderHook(
      () => useCreateExperienceFlow({ syncToUrl: false, experienceId: 'exp-1' }),
      { wrapper: createWrapper() },
    );

    let published: boolean | undefined;
    await act(async () => {
      published = await result.current.handlers.handlePublish();
    });

    expect(published).toBe(false);
    expect(result.current.apiError).toBe(LIVE_LIMIT);
    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({ description: LIVE_LIMIT, action: mockPlanAction }),
    );
  });

  it('offers nothing extra for any other publish failure', async () => {
    (publishExperience as jest.Mock).mockRejectedValue({
      status: 400,
      success: false,
      message: 'Cannot publish an experience without tickets.',
      errors: [{ code: 'invalid', detail: 'Cannot publish an experience without tickets.' }],
    });
    const { result } = renderHook(
      () => useCreateExperienceFlow({ syncToUrl: false, experienceId: 'exp-1' }),
      { wrapper: createWrapper() },
    );

    await act(async () => {
      await result.current.handlers.handlePublish();
    });

    expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ action: undefined }));
  });
});
