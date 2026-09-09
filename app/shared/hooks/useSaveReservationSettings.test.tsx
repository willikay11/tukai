import React from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';

import { ReservationSettingsDraft } from '@/types/placeReservation';

import { useSaveReservationSettings } from './usePlaces';

const createReservationProfile = jest.fn();
const updateReservationProfile = jest.fn();
const activateReservationProfile = jest.fn();
const createAvailabilityRule = jest.fn();
const deleteAvailabilityRule = jest.fn();

jest.mock('@/services/place', () => ({
  createReservationProfile: (...args: unknown[]) => createReservationProfile(...args),
  updateReservationProfile: (...args: unknown[]) => updateReservationProfile(...args),
  activateReservationProfile: (...args: unknown[]) => activateReservationProfile(...args),
  createAvailabilityRule: (...args: unknown[]) => createAvailabilityRule(...args),
  deleteAvailabilityRule: (...args: unknown[]) => deleteAvailabilityRule(...args),
}));

jest.mock('@/app/shared/hooks/useCommunities', () => ({ useGetCommunities: () => ({}) }));
jest.mock('next-auth/react', () => ({ useSession: () => ({ data: null }) }));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
    {children}
  </QueryClientProvider>
);

const rule = (extra: Record<string, unknown> = {}) => ({
  id: 'r1',
  reservationProfile: 'rp1',
  dayOfWeek: 0,
  openTime: '11:00',
  closeTime: '23:00',
  slotIntervalMinutes: 30,
  ...extra,
});

const draft = (extra: Partial<ReservationSettingsDraft> = {}): ReservationSettingsDraft => ({
  profileId: 'rp1',
  profile: { reservationType: 'restaurant_reservation', seatingCapacity: 40 },
  rules: [{ dayOfWeek: 0, openTime: '11:00', closeTime: '23:00', slotIntervalMinutes: 30 }],
  existingRules: [rule()],
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
    createAvailabilityRule.mockResolvedValue({});
    deleteAvailabilityRule.mockResolvedValue({});
  });

  // A place with no profile has to get one before hours can hang off it
  it('creates the profile, then its hours against the id it returned', async () => {
    await save(
      draft({
        profileId: undefined,
        existingRules: [],
        rules: [{ dayOfWeek: 0, openTime: '11:00', closeTime: '23:00' }],
      }),
    );

    expect(createReservationProfile).toHaveBeenCalledWith('p1', {
      reservationType: 'restaurant_reservation',
      seatingCapacity: 40,
    });
    // Against the id the create returned, not one the caller guessed
    expect(createAvailabilityRule).toHaveBeenCalledWith('p1', 'rp-new', {
      dayOfWeek: 0,
      openTime: '11:00',
      closeTime: '23:00',
    });
  });

  // Opening a profile to bookings is a step of its own, not a side effect of
  // saving its settings
  it('never activates the profile', async () => {
    await save(draft({ profileId: undefined, existingRules: [] }));
    await save(draft());

    expect(activateReservationProfile).not.toHaveBeenCalled();
  });

  it('updates the profile it already has rather than making another', async () => {
    await save(draft());

    expect(createReservationProfile).not.toHaveBeenCalled();
    expect(updateReservationProfile).toHaveBeenCalledWith('p1', 'rp1', expect.any(Object));
  });

  // Rules can only be created and deleted, so an unchanged day must be left
  // where it is rather than churned
  it('touches no rule whose day and hours are unchanged', async () => {
    await save(draft());

    expect(createAvailabilityRule).not.toHaveBeenCalled();
    expect(deleteAvailabilityRule).not.toHaveBeenCalled();
  });

  it('rewrites a day whose hours moved', async () => {
    await save(
      draft({
        rules: [{ dayOfWeek: 0, openTime: '09:00', closeTime: '23:00', slotIntervalMinutes: 30 }],
      }),
    );

    expect(deleteAvailabilityRule).toHaveBeenCalledWith('p1', 'rp1', 'r1');
    expect(createAvailabilityRule).toHaveBeenCalledWith(
      'p1',
      'rp1',
      expect.objectContaining({ openTime: '09:00' }),
    );
  });

  it('drops a day that is no longer open', async () => {
    await save(draft({ rules: [] }));

    expect(deleteAvailabilityRule).toHaveBeenCalledWith('p1', 'rp1', 'r1');
    expect(createAvailabilityRule).not.toHaveBeenCalled();
  });

  it('adds a day that was not open before', async () => {
    await save(
      draft({
        rules: [
          { dayOfWeek: 0, openTime: '11:00', closeTime: '23:00', slotIntervalMinutes: 30 },
          { dayOfWeek: 5, openTime: '11:00', closeTime: '23:00', slotIntervalMinutes: 30 },
        ],
      }),
    );

    expect(deleteAvailabilityRule).not.toHaveBeenCalled();
    expect(createAvailabilityRule).toHaveBeenCalledTimes(1);
    expect(createAvailabilityRule).toHaveBeenCalledWith(
      'p1',
      'rp1',
      expect.objectContaining({ dayOfWeek: 5 }),
    );
  });

  it('fails rather than writing hours against a profile that was not created', async () => {
    createReservationProfile.mockResolvedValue({ data: {} });

    const result = await save(draft({ profileId: undefined, existingRules: [] }));

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(createAvailabilityRule).not.toHaveBeenCalled();
  });
});
