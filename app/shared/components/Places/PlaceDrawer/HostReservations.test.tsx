import React from 'react';

import { fireEvent, render, screen, within } from '@testing-library/react';

import { Place } from '@/types/place';
import { PlaceBookingRequest, PlaceReservationProfile } from '@/types/placeReservation';

import { HostReservations } from './HostReservations';

const usePlaceBookingRequests = jest.fn();
const acceptRequest = jest.fn();
const declineRequest = jest.fn();
const admitGuest = jest.fn();
const toast = jest.fn();

jest.mock('@/app/shared/hooks/usePlaces', () => ({
  usePlaceBookingRequests: (...args: unknown[]) => usePlaceBookingRequests(...args),
  useAcceptPlaceBookingRequest: () => ({ mutate: acceptRequest, isPending: false }),
  useDeclinePlaceBookingRequest: () => ({ mutate: declineRequest, isPending: false }),
  useAdmitPlaceBookingRequest: () => ({ mutate: admitGuest, isPending: false }),
}));
jest.mock('@/app/shared/hooks/useToast', () => ({ useToast: () => ({ toast }) }));
jest.mock('@/app/shared/components/Icons', () => ({
  IconComponent: ({ iconName }: { iconName: string }) => <span data-testid={iconName} />,
}));

const place = { id: 'p1', title: 'Kazuri Beads' } as Place;
const profile = { id: 'prof-1', status: 'active' } as PlaceReservationProfile;

const todayAt = (hours: number, minutes = 0) => {
  const start = new Date();
  start.setHours(hours, minutes, 0, 0);
  return start.toISOString();
};

const booking = (
  id: string,
  status: PlaceBookingRequest['status'],
  name: string,
  startDate = todayAt(19),
  extra: Partial<PlaceBookingRequest> = {},
): PlaceBookingRequest => ({
  id,
  status,
  user: { id: `u-${id}`, firstName: name, lastName: 'Hassan' },
  restaurantDetail: { partySize: 4, specialRequests: 'Window seat' },
  occurrence: { id: `o-${id}`, startDate },
  ...extra,
});

const renderList = (requests: PlaceBookingRequest[]) => {
  usePlaceBookingRequests.mockReturnValue({
    data: { data: { results: requests } },
    isLoading: false,
  });
  const onOpenHoldOff = jest.fn();
  const onOpenSettings = jest.fn();
  render(
    <HostReservations
      place={place}
      profile={profile}
      onOpenHoldOff={onOpenHoldOff}
      onOpenSettings={onOpenSettings}
    />,
  );
  return { onOpenHoldOff, onOpenSettings };
};

describe('HostReservations', () => {
  beforeEach(() => jest.clearAllMocks());

  it("reads the venue's own list of requests for this profile", () => {
    renderList([]);

    expect(usePlaceBookingRequests).toHaveBeenCalledWith('p1', 'prof-1');
  });

  it('lists today’s reservations with the guest, party and time', () => {
    renderList([booking('a', 'completed', 'Amina')]);

    expect(screen.getByText('Amina Hassan')).toBeInTheDocument();
    expect(screen.getByText(/4 guests/)).toBeInTheDocument();
    expect(screen.getByText(/7:00 PM/)).toBeInTheDocument();
  });

  it('counts each list for the day', () => {
    renderList([
      booking('a', 'requested', 'Amina'),
      booking('b', 'completed', 'Kamau'),
      booking('c', 'redeemed', 'Njeri'),
      booking('d', 'declined', 'Otieno'),
    ]);

    expect(screen.getByRole('button', { name: 'Reservations (2)' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Admitted (1)' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'No show (1)' })).toBeInTheDocument();
  });

  it('moves between the lists', () => {
    renderList([booking('a', 'completed', 'Amina'), booking('c', 'redeemed', 'Njeri')]);

    fireEvent.click(screen.getByRole('button', { name: 'Admitted (1)' }));

    expect(screen.getByText('Njeri Hassan')).toBeInTheDocument();
    expect(screen.queryByText('Amina Hassan')).not.toBeInTheDocument();
  });

  it('says what is missing on a day with nothing in the list', () => {
    renderList([]);

    expect(screen.getByText(/Nothing booked for .* yet\./)).toBeInTheDocument();
  });

  it('keeps to the day that is picked', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(12, 0, 0, 0);
    renderList([
      booking('a', 'completed', 'Amina'),
      booking('b', 'completed', 'Kamau', tomorrow.toISOString()),
    ]);
    expect(screen.queryByText('Kamau Hassan')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: new RegExp(`${tomorrow.getDate()}$`) }));

    expect(screen.getByText('Kamau Hassan')).toBeInTheDocument();
    expect(screen.queryByText('Amina Hassan')).not.toBeInTheDocument();
  });

  it('finds a guest by name', () => {
    renderList([booking('a', 'completed', 'Amina'), booking('b', 'completed', 'Kamau')]);

    fireEvent.change(screen.getByLabelText('Search guests'), { target: { value: 'kam' } });

    expect(screen.getByText('Kamau Hassan')).toBeInTheDocument();
    expect(screen.queryByText('Amina Hassan')).not.toBeInTheDocument();
  });

  it('says so when nobody matches the search', () => {
    renderList([booking('a', 'completed', 'Amina')]);

    fireEvent.change(screen.getByLabelText('Search guests'), { target: { value: 'zed' } });

    expect(screen.getByText(/No one matches "zed"/)).toBeInTheDocument();
  });

  describe('answering a request', () => {
    it('accepts it and tells the host the guest has been told', () => {
      renderList([booking('a', 'requested', 'Amina')]);

      fireEvent.click(screen.getByRole('button', { name: "Accept Amina Hassan's request" }));

      expect(acceptRequest).toHaveBeenCalledWith('a', expect.any(Object));
      acceptRequest.mock.calls[0][1].onSuccess();
      expect(toast).toHaveBeenCalledWith({
        title: 'Reservation accepted',
        description: 'Amina has been told.',
        variant: 'success',
      });
    });

    it('says why when the API refuses', () => {
      renderList([booking('a', 'requested', 'Amina')]);
      fireEvent.click(screen.getByRole('button', { name: "Accept Amina Hassan's request" }));

      acceptRequest.mock.calls[0][1].onError(new Error('Only the host can accept a request.'));

      expect(toast).toHaveBeenCalledWith({
        title: 'Could not accept',
        description: 'Only the host can accept a request.',
        variant: 'destructive',
      });
    });

    it('offers decline only inside the row, and only once the guest is waiting', () => {
      renderList([booking('a', 'requested', 'Amina'), booking('b', 'completed', 'Kamau')]);
      expect(screen.queryByRole('button', { name: 'Decline reservation' })).not.toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: 'Kamau Hassan, show details' }));
      expect(screen.queryByRole('button', { name: 'Decline reservation' })).not.toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: 'Amina Hassan, show details' }));
      expect(screen.getByRole('button', { name: 'Decline reservation' })).toBeInTheDocument();
    });

    it('shows the guest’s note when the row is opened', () => {
      renderList([booking('a', 'requested', 'Amina')]);

      fireEvent.click(screen.getByRole('button', { name: 'Amina Hassan, show details' }));

      expect(screen.getByText('Window seat')).toBeInTheDocument();
    });

    it('declines only once the host confirms', () => {
      renderList([booking('a', 'requested', 'Amina')]);
      fireEvent.click(screen.getByRole('button', { name: 'Amina Hassan, show details' }));

      fireEvent.click(screen.getByRole('button', { name: 'Decline reservation' }));
      expect(declineRequest).not.toHaveBeenCalled();

      const dialog = screen.getByRole('alertdialog');
      fireEvent.click(within(dialog).getByRole('button', { name: 'Decline reservation' }));

      expect(declineRequest).toHaveBeenCalledWith('a', expect.any(Object));
    });

    it('keeps the request when the host backs out of declining', () => {
      renderList([booking('a', 'requested', 'Amina')]);
      fireEvent.click(screen.getByRole('button', { name: 'Amina Hassan, show details' }));
      fireEvent.click(screen.getByRole('button', { name: 'Decline reservation' }));

      fireEvent.click(screen.getByRole('button', { name: 'Keep it' }));

      expect(declineRequest).not.toHaveBeenCalled();
    });
  });

  describe('admitting a guest', () => {
    it('admits a settled reservation', () => {
      renderList([booking('a', 'completed', 'Amina')]);

      fireEvent.click(screen.getByRole('button', { name: 'Admit Amina Hassan' }));

      expect(admitGuest).toHaveBeenCalledWith('a', expect.any(Object));
    });

    it.each([
      ['accepted', 'Payment due'],
      ['pending', 'Payment pending'],
    ] as const)('cannot admit a %s booking, and says what it waits on', (status, line) => {
      renderList([booking('a', status, 'Amina')]);

      expect(screen.queryByRole('button', { name: /^Admit \w/ })).not.toBeInTheDocument();
      expect(screen.getByText(line)).toBeInTheDocument();
    });

    it('cannot admit a request that has not been answered', () => {
      renderList([booking('a', 'requested', 'Amina')]);

      expect(screen.queryByRole('button', { name: /^Admit \w/ })).not.toBeInTheDocument();
    });
  });

  it('opens hold-off and the settings from the bar below', () => {
    const { onOpenHoldOff, onOpenSettings } = renderList([]);

    fireEvent.click(screen.getByRole('button', { name: 'Hold off reservations' }));
    fireEvent.click(screen.getByRole('button', { name: 'Reservation settings' }));

    expect(onOpenHoldOff).toHaveBeenCalledTimes(1);
    expect(onOpenSettings).toHaveBeenCalledTimes(1);
  });

  it('opens on today', () => {
    renderList([]);

    const [today] = screen.getAllByRole('button', { pressed: true });

    expect(today).toHaveTextContent(String(new Date().getDate()));
  });
});
