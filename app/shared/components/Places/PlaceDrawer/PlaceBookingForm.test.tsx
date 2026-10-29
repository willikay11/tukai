import React from 'react';

import { fireEvent, render, screen, within } from '@testing-library/react';

import { Place } from '@/types/place';
import { PlaceAvailabilityRule, PlaceReservationProfile } from '@/types/placeReservation';

import { PlaceBookingForm } from './PlaceBookingForm';

const toast = jest.fn();
const requestBooking = jest.fn();
const useCreatePlaceBookingRequest = jest.fn();

jest.mock('@/app/shared/hooks/useToast', () => ({
  toast: (...args: unknown[]) => toast(...args),
}));
jest.mock('@/app/shared/hooks/usePlaces', () => ({
  useCreatePlaceBookingRequest: (...args: unknown[]) => useCreatePlaceBookingRequest(...args),
}));
jest.mock('@/app/shared/components/Icons', () => ({
  IconComponent: ({ iconName }: { iconName: string }) => <span data-testid={iconName} />,
}));
jest.mock('@/app/shared/components/Images', () => ({
  PhotoImage: () => <span data-testid="photo" />,
}));

const TUESDAY_MORNING = new Date(2026, 10, 3, 9, 0);

const place = {
  id: 'place-1',
  title: 'Kazuri Beads',
  photos: [],
  location: { city: 'Karen' },
} as unknown as Place;

const profileWith = (seatingCapacity?: number) =>
  ({
    id: 'profile-1',
    reservationType: 'restaurant_reservation',
    status: 'active',
    seatingCapacity,
  }) as PlaceReservationProfile;

const rule = (dayOfWeek: number): PlaceAvailabilityRule => ({
  id: `rule-${dayOfWeek}`,
  reservationProfile: 'profile-1',
  dayOfWeek,
  openTime: '11:00',
  closeTime: '22:00',
  slotIntervalMinutes: 30,
});

const renderForm = ({
  profile = profileWith(8),
  rules = [1, 2, 3, 4, 5, 6].map(rule),
  exceptions = [] as { id: string; reservationProfile: string; date: string; isClosed: boolean }[],
  isPending = false,
} = {}) => {
  useCreatePlaceBookingRequest.mockReturnValue({ mutate: requestBooking, isPending });
  const onDone = jest.fn();
  render(
    <PlaceBookingForm
      place={place}
      profile={profile}
      availability={{ rules, exceptions }}
      now={TUESDAY_MORNING}
      onDone={onDone}
    />,
  );
  return { onDone };
};

const pickTime = (label: string) =>
  fireEvent.click(
    within(screen.getByRole('radiogroup', { name: 'Time' })).getByRole('radio', { name: label }),
  );

describe('PlaceBookingForm', () => {
  beforeEach(() => jest.clearAllMocks());

  it('books against the live profile of the place', () => {
    renderForm();

    expect(useCreatePlaceBookingRequest).toHaveBeenCalledWith('place-1', 'profile-1');
  });

  it('shows the place, that the booking is free and a default party of two', () => {
    renderForm();

    expect(screen.getByText('Kazuri Beads')).toBeInTheDocument();
    expect(screen.getByText('Karen')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Book a table' })).toBeInTheDocument();
    expect(screen.getByText('Free booking')).toBeInTheDocument();
    expect(screen.getByText('2 guests')).toBeInTheDocument();
  });

  it('starts on the first day with times and can move to another day', () => {
    renderForm();

    const days = within(screen.getByRole('radiogroup', { name: 'Day' }));
    expect(days.getByRole('radio', { name: /Today/ })).toBeChecked();

    fireEvent.click(days.getByRole('radio', { name: /Tomorrow/ }));

    expect(days.getByRole('radio', { name: /Tomorrow/ })).toBeChecked();
  });

  it('lists the times the weekly hours allow', () => {
    renderForm();

    const times = within(screen.getByRole('radiogroup', { name: 'Time' })).getAllByRole('radio');

    expect(times[0]).toHaveAccessibleName('11:00 AM');
    expect(times[times.length - 1]).toHaveAccessibleName('9:30 PM');
  });

  it('shows a closed weekday as closed and cannot be picked', () => {
    renderForm({ rules: [2, 3, 4, 5, 6].map(rule) });

    const days = within(screen.getByRole('radiogroup', { name: 'Day' }));

    expect(days.getByRole('radio', { name: /Today/ })).toBeDisabled();
    expect(days.getByRole('radio', { name: /Today/ })).toHaveTextContent('Closed');
    expect(days.getByRole('radio', { name: /Tomorrow/ })).toBeChecked();
  });

  it('says which days new bookings are blocked', () => {
    renderForm({
      exceptions: [
        { id: 'x', reservationProfile: 'profile-1', date: '2026-11-04', isClosed: true },
      ],
    });

    expect(screen.getByText('New bookings are blocked Wed 4 Nov.')).toBeInTheDocument();
  });

  it('says so when no day in the next two weeks can be booked', () => {
    renderForm({ rules: [] });

    expect(screen.getByText(/No open times in the next two weeks/)).toBeInTheDocument();
  });

  it('steps the party up to the seats the place has, then says why it will not go higher', () => {
    renderForm({ profile: profileWith(4) });

    fireEvent.click(screen.getByRole('button', { name: 'One more guest' }));
    fireEvent.click(screen.getByRole('button', { name: 'One more guest' }));
    fireEvent.click(screen.getByRole('button', { name: 'One more guest' }));

    expect(screen.getByText('4 guests')).toBeInTheDocument();
    expect(toast).toHaveBeenCalledWith({
      description: 'Up to 4 guests per booking at Kazuri Beads.',
    });
  });

  it('never drops the party below one guest', () => {
    renderForm();

    fireEvent.click(screen.getByRole('button', { name: 'One fewer guest' }));
    fireEvent.click(screen.getByRole('button', { name: 'One fewer guest' }));

    expect(screen.getByText('1 guest')).toBeInTheDocument();
  });

  it('asks for a time before sending, and sends nothing', () => {
    const { onDone } = renderForm();

    fireEvent.click(screen.getByRole('button', { name: 'Send request' }));

    expect(toast).toHaveBeenCalledWith({ description: 'Pick a time first.' });
    expect(requestBooking).not.toHaveBeenCalled();
    expect(onDone).not.toHaveBeenCalled();
  });

  it('sends the day, the time, the party and the trimmed note as a special request', () => {
    renderForm();
    fireEvent.click(screen.getByRole('button', { name: 'One more guest' }));
    pickTime('7:00 PM');
    fireEvent.change(screen.getByPlaceholderText(/A birthday/), {
      target: { value: '  Window seat please  ' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Send request' }));

    expect(requestBooking).toHaveBeenCalledWith(
      {
        requestedDate: '2026-11-03',
        requestedTime: '19:00',
        partySize: 3,
        specialRequests: 'Window seat please',
      },
      expect.any(Object),
    );
  });

  it('leaves the special request out when nothing was written', () => {
    renderForm();
    pickTime('7:00 PM');

    fireEvent.click(screen.getByRole('button', { name: 'Send request' }));

    expect(requestBooking.mock.calls[0][0].specialRequests).toBeUndefined();
  });

  it('books the day that was picked, not the first one', () => {
    renderForm();
    fireEvent.click(
      within(screen.getByRole('radiogroup', { name: 'Day' })).getByRole('radio', {
        name: /Tomorrow/,
      }),
    );
    pickTime('12:30 PM');

    fireEvent.click(screen.getByRole('button', { name: 'Send request' }));

    expect(requestBooking.mock.calls[0][0]).toMatchObject({
      requestedDate: '2026-11-04',
      requestedTime: '12:30',
    });
  });

  it('confirms the request and returns to the place once it is sent', () => {
    const { onDone } = renderForm();
    pickTime('7:00 PM');
    fireEvent.click(screen.getByRole('button', { name: 'Send request' }));

    requestBooking.mock.calls[0][1].onSuccess({ data: {} });

    expect(toast).toHaveBeenCalledWith({
      description: 'Request sent. Kazuri Beads will answer it soon.',
    });
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it('says when the place has to answer, once the API names the time', () => {
    renderForm();
    pickTime('7:00 PM');
    fireEvent.click(screen.getByRole('button', { name: 'Send request' }));

    requestBooking.mock.calls[0][1].onSuccess({ data: { respondBy: '2026-11-05T09:00:00' } });

    expect(toast).toHaveBeenCalledWith({
      description: 'Request sent. Kazuri Beads has until Thu 5 Nov, 9:00 AM to answer.',
    });
  });

  it('keeps the form open and says why when the request is refused', () => {
    const { onDone } = renderForm();
    pickTime('7:00 PM');
    fireEvent.click(screen.getByRole('button', { name: 'Send request' }));

    requestBooking.mock.calls[0][1].onError(new Error('requested_date cannot be in the past.'));

    expect(toast).toHaveBeenCalledWith({
      title: 'Could not send this request',
      description: 'requested_date cannot be in the past.',
      variant: 'destructive',
    });
    expect(onDone).not.toHaveBeenCalled();
  });

  it('cannot be sent twice while the first request is on its way', () => {
    renderForm({ isPending: true });

    expect(screen.getByRole('button', { name: 'Sending...' })).toBeDisabled();
  });
});
