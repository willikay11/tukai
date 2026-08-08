import React from 'react';

import { useSession } from 'next-auth/react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';

import { useCreateExperienceFlow } from './useCreateExperienceFlow';

// Mock uuid (ESM-only package jest can't parse)
jest.mock('uuid', () => ({
  v4: () => 'test-uuid-v4',
  v1: () => 'test-uuid-v1',
}));

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

  describe('validateTickets for recurring experiences', () => {
    const recurringTicket = {
      id: 'ticket-1',
      name: 'General',
      quantity: 10,
      amount: 500,
      startTime: null,
      endTime: null,
      salesStartDate: null,
      salesStartTime: null,
      salesEndDate: null,
      salesEndTime: null,
      acceptPartialPayment: false,
      // Recurring only captures a closing (end) validity — no start-relative field
      salesStartRelative: null,
      salesEndRelative: { amount: 1, unit: 'hour' as const, anchor: 'start' as const },
      duplicateForEntirePeriod: false,
      slotIndex: 0,
    };

    it('passes when a recurring ticket has salesEndRelative but no salesStartRelative', () => {
      const { result } = renderHook(() => useCreateExperienceFlow(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.updateFormData({ isRecurring: true, experiencePricing: 'paid' });
        result.current.updateTicketsFormData({ items: [recurringTicket] });
      });

      let isValid = false;
      act(() => {
        isValid = result.current.validateTickets();
      });

      expect(isValid).toBe(true);
    });

    // Sales validity is commented out in TicketForm, so a ticket without it must
    // still pass — flip this back to expect(false) when that section returns
    it('passes when a recurring ticket has no salesEndRelative', () => {
      const { result } = renderHook(() => useCreateExperienceFlow(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.updateFormData({ isRecurring: true, experiencePricing: 'paid' });
        result.current.updateTicketsFormData({
          items: [{ ...recurringTicket, salesEndRelative: null }],
        });
      });

      let isValid = false;
      act(() => {
        isValid = result.current.validateTickets();
      });

      expect(isValid).toBe(true);
    });

    it('advances from the tickets step to guests (reproduces Save & Continue)', () => {
      const { result } = renderHook(() => useCreateExperienceFlow(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.handlers.handleStepChange('dates-tickets');
        result.current.updateFormData({ isRecurring: true, experiencePricing: 'paid' });
        result.current.updateTicketsFormData({ items: [recurringTicket] });
      });

      // Mirror the onSaveContinue handler wired to the tickets step.
      act(() => {
        if (result.current.validateTickets()) {
          result.current.handlers.handleStepChange('guests');
        }
      });

      expect(result.current.activeStep).toBe('guests');
    });
  });

  describe('validateDateType time ordering', () => {
    const community = { id: 'community-1', name: 'Community 1', imageUrl: null };

    const renderFlow = () =>
      renderHook(() => useCreateExperienceFlow(), { wrapper: createWrapper() });

    it('fails when a single-day end time is before its start time', () => {
      const { result } = renderFlow();

      act(() => {
        result.current.updateFormData({
          community,
          experienceType: 'one-time',
          date: '2026-09-01',
          startTime: '14:00',
          endTime: '10:00',
        });
      });

      let isValid = true;
      act(() => {
        isValid = result.current.validateDateType();
      });

      expect(isValid).toBe(false);
      expect(result.current.dateTypeErrors.endTime).toBe('End time must be after start time');
    });

    it('fails when a recurring slot ends before it starts', () => {
      const { result } = renderFlow();

      act(() => {
        result.current.updateFormData({
          community,
          experienceType: 'one-time',
          isRecurring: true,
          recurringDays: ['mon'],
          recurrenceStartDate: '2026-09-01',
          recurrenceEndDate: '2026-09-30',
          timeSlots: [{ startTime: '18:00', endTime: '17:00' }],
        });
      });

      let isValid = true;
      act(() => {
        isValid = result.current.validateDateType();
      });

      expect(isValid).toBe(false);
      expect(result.current.dateTypeErrors['slots.0.endTime']).toBe(
        'End time must be after start time',
      );
    });

    it('fails when a multi-day experience starts and ends on the same day out of order', () => {
      const { result } = renderFlow();

      act(() => {
        result.current.updateFormData({
          community,
          experienceType: 'multi-day',
          multiDayStartDate: '2026-09-01',
          multiDayStartTime: '14:00',
          multiDayEndDate: '2026-09-01',
          multiDayEndTime: '09:00',
        });
      });

      let isValid = true;
      act(() => {
        isValid = result.current.validateDateType();
      });

      expect(isValid).toBe(false);
      expect(result.current.dateTypeErrors.multiDayEndTime).toBe(
        'End time must be after start time',
      );
    });

    it('allows a multi-day experience to end earlier in the day than it started', () => {
      const { result } = renderFlow();

      act(() => {
        result.current.updateFormData({
          community,
          experienceType: 'multi-day',
          multiDayStartDate: '2026-09-01',
          multiDayStartTime: '14:00',
          multiDayEndDate: '2026-09-03',
          multiDayEndTime: '09:00',
        });
      });

      let isValid = false;
      act(() => {
        isValid = result.current.validateDateType();
      });

      expect(isValid).toBe(true);
    });
  });
});
