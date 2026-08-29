import React from 'react';

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import moment from 'moment';

import { ReservationPanel } from './ReservationPanel';

const toast = jest.fn();
jest.mock('@/app/shared/hooks/useToast', () => ({ useToast: () => ({ toast }) }));

const usePlaceReservationProfiles = jest.fn();
const usePlaceBookingRequests = jest.fn();
const cancelBooking = jest.fn();
jest.mock('@/app/shared/hooks/usePlaces', () => ({
  usePlaceReservationProfiles: (id: string) => usePlaceReservationProfiles(id),
  usePlaceBookingRequests: (id: string, profileId?: string) =>
    usePlaceBookingRequests(id, profileId),
  useCancelPlaceBookingRequest: () => ({ mutate: cancelBooking, isPending: false }),
}));

const profile = (extra: Record<string, unknown> = {}) => ({
  id: 'rp1',
  place: 'p1',
  reservationType: 'restaurant_reservation',
  status: 'active',
  seatingCapacity: 40,
  ...extra,
});

const withProfiles = (profiles: unknown[], isLoading = false) =>
  usePlaceReservationProfiles.mockReturnValue({
    data: { data: { results: profiles } },
    isLoading,
  });

const withBookings = (results: unknown[]) =>
  usePlaceBookingRequests.mockReturnValue({ data: { data: { results } } });

const renderPanel = () => render(<ReservationPanel placeId="p1" placeName="Kraftory" />);

describe('ReservationPanel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    withProfiles([profile()]);
    withBookings([]);
  });

  it('offers a reservation when the place has an active profile', () => {
    renderPanel();

    expect(screen.getByText('Make a Reservation')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Make Reservation/ })).toBeInTheDocument();
  });

  // A place is only bookable once its owning community sets up a profile. The
  // panel still renders — hiding it would leave the whole column empty — but
  // the button cannot be used.
  describe('before the place opens reservations', () => {
    const expectNotBookable = () => {
      expect(screen.getByText('Make a Reservation')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Make Reservation/ })).toBeDisabled();
      expect(screen.getByText('Kraftory has not opened up reservations yet.')).toBeInTheDocument();
      // The "Free reservation" promise only holds where booking works
      expect(screen.queryByText('Free reservation')).not.toBeInTheDocument();
    };

    it('stays visible but disabled when the place has no profile', () => {
      withProfiles([]);

      renderPanel();

      expectNotBookable();
    });

    it('treats a draft profile as not yet open', () => {
      withProfiles([profile({ status: 'draft' })]);

      renderPanel();

      expectNotBookable();
    });

    it('treats a paused profile as not yet open', () => {
      withProfiles([profile({ status: 'paused' })]);

      renderPanel();

      expectNotBookable();
    });

    // A place may hold a cinema profile as well; only the restaurant one takes
    // table bookings
    it('ignores a cinema profile', () => {
      withProfiles([profile({ reservationType: 'cinema_reservation' })]);

      renderPanel();

      expectNotBookable();
    });

    // Disabled, so it must not be a link either
    it('offers no route to the reservation page', () => {
      withProfiles([]);

      renderPanel();

      expect(screen.queryByRole('link', { name: /Make Reservation/ })).not.toBeInTheDocument();
    });
  });

  it('shows a skeleton while the profile loads', () => {
    withProfiles([], true);

    const { container } = renderPanel();

    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  // The form is its own page, so the button is a link
  it('links to the reservation page', () => {
    renderPanel();

    expect(screen.getByRole('link', { name: /Make Reservation/ })).toHaveAttribute(
      'href',
      '/places/p1/reserve',
    );
  });

  // Claiming the place is how it becomes bookable, so that is the way out of
  // the not-yet-open state
  describe('claiming', () => {
    it('offers to claim a place that is not open for reservations', () => {
      withProfiles([]);

      renderPanel();

      expect(screen.getByText(/Own or manage this place\?/)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Claim it' })).toBeInTheDocument();
    });

    // Claiming is a page of its own, seeded with the place being claimed
    it('links to the claim page for this place', () => {
      withProfiles([]);

      renderPanel();

      expect(screen.getByRole('link', { name: 'Claim it' })).toHaveAttribute(
        'href',
        '/places/claim?placeId=p1',
      );
    });

    // Already bookable — nothing to claim
    it('does not offer a claim once the place takes reservations', () => {
      renderPanel();

      expect(screen.queryByRole('link', { name: 'Claim it' })).not.toBeInTheDocument();
    });

    // The free-to-reserve promise only holds where booking works
    it('hides the free-to-reserve card until the place is bookable', () => {
      withProfiles([]);

      renderPanel();

      expect(screen.queryByText('Free to reserve')).not.toBeInTheDocument();
    });

    it('shows the free-to-reserve card once it is', () => {
      renderPanel();

      expect(screen.getByText('Free to reserve')).toBeInTheDocument();
    });
  });

  describe('my reservations', () => {
    // Relative to today: the calendar opens on the current month, and a fixture
    // pinned to a fixed date would drop out of view as the clock moved on
    const inDays = (days: number) => moment().add(days, 'day').hour(19).minute(0).toISOString();

    const booking = (extra: Record<string, unknown> = {}) => ({
      id: 'b1',
      status: 'requested',
      restaurantDetail: { partySize: 4 },
      occurrence: { id: 'o1', startDate: moment().hour(19).minute(0).toISOString() },
      ...extra,
    });

    it('is absent when the reader has none', () => {
      renderPanel();

      expect(screen.queryByText('My Reservations')).not.toBeInTheDocument();
    });

    it('lists the reader’s requests', () => {
      withBookings([booking()]);

      renderPanel();

      expect(screen.getByText('My Reservations')).toBeInTheDocument();
      expect(screen.getByText(/4 Pax/)).toBeInTheDocument();
    });

    // A reservation is a Purchase — the venue still has to accept it
    it('says a request is not yet confirmed', () => {
      withBookings([booking()]);

      renderPanel();

      expect(screen.getByText('Awaiting confirmation')).toBeInTheDocument();
    });

    it('marks an accepted booking as confirmed', () => {
      withBookings([booking({ status: 'accepted' })]);

      renderPanel();

      expect(screen.getByText('Confirmed')).toBeInTheDocument();
    });

    it('cancels through the shared purchase action', async () => {
      withBookings([booking()]);
      const user = userEvent.setup();

      renderPanel();
      await user.click(screen.getByRole('button', { name: 'Cancel Reservation' }));

      expect(cancelBooking).toHaveBeenCalledWith('b1', expect.anything());
    });

    it('confirms a cancellation with the modal rather than a toast', async () => {
      withBookings([booking()]);
      // The mutation reports success through its own callback
      cancelBooking.mockImplementation((_id: string, { onSuccess }: { onSuccess: () => void }) =>
        onSuccess(),
      );
      const user = userEvent.setup();

      renderPanel();
      await user.click(screen.getByRole('button', { name: 'Cancel Reservation' }));

      expect(await screen.findByText('Reservation Cancelled Successfully')).toBeInTheDocument();
      expect(screen.getByText(/table at Kraftory has been released/)).toBeInTheDocument();
      expect(toast).not.toHaveBeenCalled();
    });

    it('dismisses the confirmation from its own button', async () => {
      withBookings([booking()]);
      cancelBooking.mockImplementation((_id: string, { onSuccess }: { onSuccess: () => void }) =>
        onSuccess(),
      );
      const user = userEvent.setup();

      renderPanel();
      await user.click(screen.getByRole('button', { name: 'Cancel Reservation' }));
      await user.click(await screen.findByRole('button', { name: 'Done' }));

      await waitFor(() =>
        expect(screen.queryByText('Reservation Cancelled Successfully')).not.toBeInTheDocument(),
      );
    });

    // The list is laid out a month at a time, like the experiences reserved tab
    it('shows only the chosen day once a day pill is picked', async () => {
      const today = moment();
      // Two bookings this month, on different days
      const other = moment().date() === today.clone().endOf('month').date() ? -1 : 1;
      withBookings([
        booking(),
        booking({
          id: 'b2',
          restaurantDetail: { partySize: 9 },
          occurrence: { id: 'o2', startDate: inDays(other) },
        }),
      ]);
      const user = userEvent.setup();

      renderPanel();
      expect(screen.getByText(/4 Pax/)).toBeInTheDocument();
      expect(screen.getByText(/9 Pax/)).toBeInTheDocument();

      await user.click(
        screen.getByRole('button', {
          name: new RegExp(`${today.format('ddd')}\\s*${today.date()}$`),
        }),
      );

      expect(screen.getByText(/4 Pax/)).toBeInTheDocument();
      expect(screen.queryByText(/9 Pax/)).not.toBeInTheDocument();
    });

    it('steps to another month rather than listing everything at once', async () => {
      withBookings([booking()]);
      const user = userEvent.setup();

      renderPanel();
      await user.click(screen.getByRole('button', { name: 'Next month' }));

      expect(screen.queryByText(/4 Pax/)).not.toBeInTheDocument();
      expect(screen.getByText('Nothing this month')).toBeInTheDocument();
    });

    // Declined, cancelled and expired all mean there is no table, so they read
    // the same way
    it.each(['declined', 'cancelled', 'expired'])('marks %s as a lost table', (status) => {
      withBookings([booking({ status })]);

      renderPanel();

      const label = status.charAt(0).toUpperCase() + status.slice(1);
      expect(screen.getByText(label)).toHaveClass('bg-red-100', 'text-red-600');
    });

    // Nothing to cancel once it is already declined or cancelled
    it('hides cancel on a finished booking', () => {
      withBookings([booking({ status: 'cancelled' })]);

      renderPanel();

      expect(screen.queryByRole('button', { name: 'Cancel Reservation' })).not.toBeInTheDocument();
    });
  });
});
