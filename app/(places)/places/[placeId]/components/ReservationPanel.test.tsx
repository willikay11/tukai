import React from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

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

  describe('my reservations', () => {
    const booking = (extra: Record<string, unknown> = {}) => ({
      id: 'b1',
      status: 'requested',
      restaurantDetail: { partySize: 4 },
      occurrence: { id: 'o1', startDate: '2026-06-27T19:00:00Z' },
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

    // Nothing to cancel once it is already declined or cancelled
    it('hides cancel on a finished booking', () => {
      withBookings([booking({ status: 'cancelled' })]);

      renderPanel();

      expect(screen.queryByRole('button', { name: 'Cancel Reservation' })).not.toBeInTheDocument();
    });
  });
});
