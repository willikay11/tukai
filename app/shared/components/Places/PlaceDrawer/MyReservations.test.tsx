import React from 'react';

import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';

import { Place } from '@/types/place';
import { PlaceBookingRequest } from '@/types/placeReservation';

import { MyReservations } from './MyReservations';

const useBookings = jest.fn();
const cancelBooking = jest.fn();
const toast = jest.fn();

jest.mock('@/app/shared/hooks/usePlaces', () => ({
  usePlaceBookingRequests: (...args: unknown[]) => useBookings(...args),
  useCancelPlaceBookingRequest: () => ({
    mutate: (...args: unknown[]) => cancelBooking(...args),
    isPending: false,
  }),
}));
jest.mock('@/app/shared/hooks/useToast', () => ({ useToast: () => ({ toast }) }));

const FUTURE = new Date(Date.now() + 3 * 86_400_000).toISOString();

const place = { id: 'p1', title: 'Kazuri Beads', photos: [] } as unknown as Place;

const booking = (id: string, startDate = FUTURE): PlaceBookingRequest => ({
  id,
  status: 'accepted',
  restaurantDetail: { partySize: 2 },
  occurrence: { id: `o-${id}`, startDate },
});

const givenBookings = (results: PlaceBookingRequest[]) =>
  useBookings.mockReturnValue({ data: { data: { results } } });

describe('MyReservations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing without a live reservation here', () => {
    givenBookings([]);

    const { container } = render(<MyReservations place={place} profile={undefined} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('asks for the bookings of the place profile it was given', () => {
    givenBookings([]);

    render(<MyReservations place={place} profile={{ id: 'prof-1' } as never} />);

    expect(useBookings).toHaveBeenCalledWith('p1', 'prof-1');
  });

  it('shows the next booking with its party size and no edit control', () => {
    givenBookings([booking('b1')]);

    render(<MyReservations place={place} profile={{ id: 'prof-1' } as never} />);

    expect(screen.getByRole('heading', { name: 'My reservations' })).toBeInTheDocument();
    expect(screen.getByText(/^2 Pax · /)).toBeInTheDocument();
    expect(screen.queryByText(/edit/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /reservation \d of/i })).not.toBeInTheDocument();
  });

  it('pages between bookings when there is more than one', () => {
    givenBookings([
      booking('b1'),
      booking('b2', new Date(Date.now() + 9 * 86_400_000).toISOString()),
    ]);

    render(<MyReservations place={place} profile={{ id: 'prof-1' } as never} />);

    fireEvent.click(screen.getByRole('button', { name: 'Reservation 2 of 2' }));

    expect(screen.getByRole('button', { name: 'Reservation 2 of 2' })).toHaveAttribute(
      'aria-current',
      'true',
    );
  });

  it('cancels only once the reader confirms', async () => {
    givenBookings([booking('b1')]);
    cancelBooking.mockImplementation((_id, options) => options.onSuccess());

    render(<MyReservations place={place} profile={{ id: 'prof-1' } as never} />);

    fireEvent.click(screen.getByRole('button', { name: 'Cancel reservation' }));
    expect(cancelBooking).not.toHaveBeenCalled();

    const dialog = screen.getByRole('alertdialog');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel reservation' }));

    await waitFor(() => expect(cancelBooking).toHaveBeenCalledWith('b1', expect.any(Object)));
    expect(toast).toHaveBeenCalledWith(expect.objectContaining({ title: 'Reservation cancelled' }));
  });
});
