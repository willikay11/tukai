import React from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';

import { ReservationSettingsDraft } from '@/types/placeReservation';

import { useSaveReservationSettings } from './usePlaces';

const createReservationProfile = jest.fn();
const updateReservationProfile = jest.fn();
const activateReservationProfile = jest.fn();

jest.mock('@/services/place', () => ({
  createReservationProfile: (...args: unknown[]) => createReservationProfile(...args),
  updateReservationProfile: (...args: unknown[]) => updateReservationProfile(...args),
  activateReservationProfile: (...args: unknown[]) => activateReservationProfile(...args),
}));

jest.mock('@/app/shared/hooks/useCommunities', () => ({ useGetCommunities: () => ({}) }));
jest.mock('next-auth/react', () => ({ useSession: () => ({ data: null }) }));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
    {children}
  </QueryClientProvider>
);

const MONDAY = { dayOfWeek: 0, openTime: '11:00', closeTime: '23:00', slotIntervalMinutes: 30 };

const draft = (extra: Partial<ReservationSettingsDraft> = {}): ReservationSettingsDraft => ({
  profileId: 'rp1',
  profile: { reservationType: 'restaurant_reservation', seatingCapacity: 40, paymentType: 'free' },
  rules: [MONDAY],
  isActive: true,
  ...extra,
});

const save = async (value: ReservationSettingsDraft) => {
  const { result } = renderHook(() => useSaveReservationSettings('p1'), { wrapper });
  result.current.mutate(value);
  await waitFor(() => expect(result.current.isPending).toBe(false));
  return result;
};

describe('useSaveReservationSettings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    createReservationProfile.mockResolvedValue({ data: { id: 'rp-new' } });
    updateReservationProfile.mockResolvedValue({ data: { id: 'rp1' } });
    activateReservationProfile.mockResolvedValue({});
  });

  // DEV-462: the profile and its whole weekly schedule go in one request, so
  // a save can't leave half the hours written
  it('creates the profile with its hours in one request, then opens it', async () => {
    await save(draft({ profileId: undefined, isActive: false }));

    expect(createReservationProfile).toHaveBeenCalledWith('p1', {
      reservationType: 'restaurant_reservation',
      seatingCapacity: 40,
      paymentType: 'free',
      availabilityRules: [MONDAY],
    });
    // Against the id the create returned, not one the caller guessed
    expect(activateReservationProfile).toHaveBeenCalledWith('p1', 'rp-new');
  });

  it('sends the payment terms and timings with the schedule', async () => {
    const profile: ReservationSettingsDraft['profile'] = {
      reservationType: 'restaurant_reservation',
      paymentType: 'entry_fee',
      maxPartySize: 8,
      respondWithinHours: 6,
      payWithinHours: 3,
      depositAmount: null,
      entryFees: [{ guestType: 'Adults', price: { amount: '1500', currency: 'KES' } }],
    };

    await save(draft({ profile, rules: [] }));

    // An empty schedule is sent too: it closes every day
    expect(updateReservationProfile).toHaveBeenCalledWith('p1', 'rp1', {
      ...profile,
      availabilityRules: [],
    });
  });

  it('leaves an already-open profile alone', async () => {
    await save(draft());

    expect(createReservationProfile).not.toHaveBeenCalled();
    expect(activateReservationProfile).not.toHaveBeenCalled();
  });

  // A profile that was saved while still a draft has to be opened, or the
  // place page goes on saying it takes no reservations
  it('opens a profile that is not active yet', async () => {
    await save(draft({ isActive: false }));

    expect(activateReservationProfile).toHaveBeenCalledWith('p1', 'rp1');
  });

  it('fails rather than opening a profile that was not created', async () => {
    createReservationProfile.mockResolvedValue({ data: {} });

    const result = await save(draft({ profileId: undefined, isActive: false }));

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(activateReservationProfile).not.toHaveBeenCalled();
  });
});
