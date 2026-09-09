import React from 'react';

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Place } from '@/types/place';

import { ReservationSettingsContent } from './ReservationSettingsContent';

const push = jest.fn();
jest.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));

const toast = jest.fn();
jest.mock('@/app/shared/hooks/useToast', () => ({ useToast: () => ({ toast }) }));

const save = jest.fn();
let isManager = true;
let profiles: unknown[] = [];
let rules: unknown[] = [];

jest.mock('@/app/shared/hooks/usePlaces', () => ({
  usePlaceManager: () => ({ isManager, isLoading: false }),
  usePlaceReservationProfiles: () => ({ data: { data: { results: profiles } }, isLoading: false }),
  usePlaceAvailability: () => ({ data: { data: { rules } }, isLoading: false }),
  useSaveReservationSettings: () => ({ mutate: save, isPending: false }),
}));

const place = { id: 'p1', title: 'Kraftory Biergarten' } as Place;

const renderSettings = () => render(<ReservationSettingsContent place={place} />);

describe('ReservationSettingsContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    save.mockReset();
    isManager = true;
    profiles = [];
    rules = [];
  });

  it('opens on the reservation type, with the fields the form needs', () => {
    renderSettings();

    expect(screen.getByRole('heading', { name: 'Reservation Settings' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Free Reservation' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByLabelText('Total Seating Capacity')).toBeInTheDocument();
    expect(screen.getByLabelText('Max Party Size Per Booking')).toBeInTheDocument();
    expect(screen.getByLabelText('Buffer between bookings')).toBeInTheDocument();
    expect(screen.getByText('Active days of the week')).toBeInTheDocument();
  });

  it('turns away anyone who does not manage the place', () => {
    isManager = false;

    renderSettings();

    expect(screen.getByText(/Only the community that owns/)).toBeInTheDocument();
  });

  // The API stores a rule per day; the form asks for the hours once
  it('writes one rule per chosen day, from one set of hours', async () => {
    const user = userEvent.setup();
    renderSettings();

    await user.click(screen.getByRole('button', { name: 'Monday' }));
    await user.click(screen.getByRole('button', { name: 'Saturday' }));
    await user.type(screen.getByLabelText('Total Seating Capacity'), '40');
    await user.type(screen.getByLabelText('Max Party Size Per Booking'), '8');
    // The pickers are Radix selects: the trigger is the combobox
    const [opening, closing] = screen.getAllByRole('combobox');
    await user.click(opening);
    await user.click(await screen.findByRole('option', { name: '11:00 AM' }));
    await user.click(closing);
    await user.click(await screen.findByRole('option', { name: '11:00 PM' }));

    await user.click(screen.getByRole('button', { name: 'Save Changes' }));

    await waitFor(() => expect(save).toHaveBeenCalled());

    const [draft] = save.mock.calls[0];
    expect(draft.profile).toEqual({
      reservationType: 'restaurant_reservation',
      seatingCapacity: 40,
      maxPartySize: 8,
    });
    // Monday is 0 and Saturday is 5, per the API's own numbering
    expect(draft.rules).toEqual([
      { dayOfWeek: 0, openTime: '11:00', closeTime: '23:00' },
      { dayOfWeek: 5, openTime: '11:00', closeTime: '23:00' },
    ]);
    expect(draft.profileId).toBeUndefined();
  });

  it('will not take a party size of zero', async () => {
    const user = userEvent.setup();
    renderSettings();

    await user.click(screen.getByRole('button', { name: 'Monday' }));
    await user.type(screen.getByLabelText('Max Party Size Per Booking'), '0');
    await user.click(screen.getByRole('button', { name: 'Save Changes' }));

    expect(save).not.toHaveBeenCalled();
    expect(screen.getByText('Enter a number greater than zero')).toBeInTheDocument();
  });

  it('will not save without a day', async () => {
    const user = userEvent.setup();
    renderSettings();

    await user.click(screen.getByRole('button', { name: 'Save Changes' }));

    expect(save).not.toHaveBeenCalled();
    expect(screen.getByText('Pick at least one day')).toBeInTheDocument();
  });

  // The closing picker refuses anything before the opening time, but the
  // opening picker is not held back the same way — so it is the direction the
  // schema has to catch
  it('refuses an opening time dragged past the closing one', async () => {
    const user = userEvent.setup();
    rules = [
      { id: 'r1', dayOfWeek: 0, openTime: '11:00', closeTime: '23:00', slotIntervalMinutes: 30 },
    ];
    profiles = [
      {
        id: 'rp1',
        reservationType: 'restaurant_reservation',
        status: 'active',
        seatingCapacity: 40,
      },
    ];
    renderSettings();

    const [opening] = screen.getAllByRole('combobox');
    await user.click(opening);
    await user.click(await screen.findByRole('option', { name: '11:30 PM' }));
    await user.click(screen.getByRole('button', { name: 'Save Changes' }));

    expect(save).not.toHaveBeenCalled();
    expect(screen.getByText('Closing time has to be after opening time')).toBeInTheDocument();
  });

  it('opens on what the place already has set up', () => {
    profiles = [
      {
        id: 'rp1',
        reservationType: 'restaurant_reservation',
        status: 'active',
        seatingCapacity: 40,
        maxPartySize: 8,
      },
    ];
    rules = [
      {
        id: 'r1',
        dayOfWeek: 0,
        openTime: '11:00:00',
        closeTime: '23:00:00',
        slotIntervalMinutes: 30,
      },
      {
        id: 'r2',
        dayOfWeek: 5,
        openTime: '11:00:00',
        closeTime: '23:00:00',
        slotIntervalMinutes: 30,
      },
    ];

    renderSettings();

    expect(screen.getByLabelText('Total Seating Capacity')).toHaveValue(40);
    expect(screen.getByLabelText('Max Party Size Per Booking')).toHaveValue(8);
    expect(screen.getByLabelText('Buffer between bookings')).toHaveValue(30);
    expect(screen.getByRole('button', { name: 'Monday' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Tuesday' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
    expect(screen.getByText(/11:00 AM - 11:00 PM/)).toBeInTheDocument();
  });

  it('sends the existing profile and rules so the save can tell what moved', async () => {
    const user = userEvent.setup();
    profiles = [
      {
        id: 'rp1',
        reservationType: 'restaurant_reservation',
        status: 'active',
        seatingCapacity: 40,
      },
    ];
    rules = [{ id: 'r1', dayOfWeek: 0, openTime: '11:00', closeTime: '23:00' }];
    renderSettings();

    await user.click(screen.getByRole('button', { name: 'Tuesday' }));
    await user.click(screen.getByRole('button', { name: 'Save Changes' }));

    await waitFor(() => expect(save).toHaveBeenCalled());

    const [draft] = save.mock.calls[0];
    expect(draft.profileId).toBe('rp1');
    expect(draft.existingRules).toHaveLength(1);
  });

  it('confirms with the modal once the settings are saved', async () => {
    const user = userEvent.setup();
    save.mockImplementation((_draft, options) => options?.onSuccess?.());
    profiles = [
      {
        id: 'rp1',
        reservationType: 'restaurant_reservation',
        status: 'active',
        seatingCapacity: 40,
      },
    ];
    rules = [{ id: 'r1', dayOfWeek: 0, openTime: '11:00', closeTime: '23:00' }];
    renderSettings();

    await user.click(screen.getByRole('button', { name: 'Tuesday' }));
    await user.click(screen.getByRole('button', { name: 'Save Changes' }));

    expect(await screen.findByText('Reservation Settings Saved!')).toBeInTheDocument();
  });
});
