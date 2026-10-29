import React from 'react';

import { fireEvent, render, screen, within } from '@testing-library/react';

import { PlaceAvailabilityException, PlaceReservationProfile } from '@/types/placeReservation';

import { HostReservationsSection } from './HostReservationsSection';
import { hostReservations } from './host-reservations';
import { dayKey } from './week-strip';

jest.mock('@/app/shared/components/Icons', () => ({
  IconComponent: ({ iconName }: { iconName: string }) => <span data-testid={iconName} />,
}));

const today = new Date();
const todayKey = dayKey(today);
const at = (hour: number) =>
  new Date(today.getFullYear(), today.getMonth(), today.getDate(), hour).toISOString();

const profile = (status: PlaceReservationProfile['status'] = 'active') =>
  ({ id: 'rp1', reservationType: 'restaurant_reservation', status }) as PlaceReservationProfile;

const request = (id: string, status: string, hour = 18) =>
  ({ id, status, occurrence: { id: `o-${id}`, startDate: at(hour) } }) as never;

const renderSection = (
  requests: unknown[] = [],
  extra: {
    status?: PlaceReservationProfile['status'];
    exceptions?: PlaceAvailabilityException[];
  } = {},
) => {
  const onOpen = jest.fn();
  render(
    <HostReservationsSection
      reservations={hostReservations(requests as never[])}
      profile={profile(extra.status)}
      exceptions={extra.exceptions ?? []}
      onOpen={onOpen}
    />,
  );
  return { onOpen };
};

describe('HostReservationsSection', () => {
  it('says how many requests need an answer', () => {
    renderSection([request('a', 'requested'), request('b', 'requested', 20)]);

    expect(screen.getByText('2 requests need an answer')).toBeInTheDocument();
  });

  it('says so when nothing is waiting', () => {
    renderSection([request('a', 'completed')]);

    expect(screen.getByText('No requests waiting for an answer')).toBeInTheDocument();
  });

  it('counts the chosen day under Requests, Confirmed, Admitted and No show', () => {
    renderSection([
      request('a', 'requested'),
      request('b', 'completed'),
      request('c', 'completed', 20),
      request('d', 'redeemed'),
      request('e', 'declined'),
    ]);

    const group = screen.getByRole('group', { name: 'Reservation status' });
    expect(
      within(group).getByRole('button', { name: 'Requests, 1, needs an answer' }),
    ).toBeVisible();
    expect(within(group).getByRole('button', { name: 'Confirmed, 2' })).toBeVisible();
    expect(within(group).getByRole('button', { name: 'Admitted, 1' })).toBeVisible();
    expect(within(group).getByRole('button', { name: 'No show, 1' })).toBeVisible();
  });

  it('opens the list on the day and group of the status that was pressed', () => {
    const { onOpen } = renderSection([request('d', 'redeemed')]);

    fireEvent.click(screen.getByRole('button', { name: 'Admitted, 1' }));

    expect(onOpen).toHaveBeenCalledWith(todayKey, 'admitted');
  });

  it('opens the list on the busiest status from the heading', () => {
    const { onOpen } = renderSection([request('d', 'redeemed')]);

    fireEvent.click(screen.getByRole('button', { name: 'Reservations' }));

    expect(onOpen).toHaveBeenCalledWith(todayKey, 'admitted');
  });

  it('opens the list on Requests from the heading when the day is empty', () => {
    const { onOpen } = renderSection([]);

    fireEvent.click(screen.getByRole('button', { name: 'Reservations' }));

    expect(onOpen).toHaveBeenCalledWith(todayKey, 'reservations');
  });

  it('shows no hold line on a place that is open as usual', () => {
    renderSection([]);

    expect(screen.queryByTestId('StopCircleIcon')).not.toBeInTheDocument();
  });

  it('says new bookings are paused', () => {
    renderSection([], { status: 'paused' });

    expect(screen.getByText('New bookings are paused.')).toBeInTheDocument();
  });

  it('names the dates that are blocked', () => {
    renderSection([], {
      exceptions: [{ id: 'x', reservationProfile: 'rp1', date: '2099-01-05', isClosed: true }],
    });

    expect(screen.getByText('Dates blocked: Mon 5 Jan.')).toBeInTheDocument();
  });
});
