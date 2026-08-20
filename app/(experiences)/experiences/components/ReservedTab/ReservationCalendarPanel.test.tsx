import React from 'react';

import { fireEvent, render, screen } from '@testing-library/react';

import { ReservationCalendarPanel } from './ReservationCalendarPanel';
import { PanelItem } from './panelItems';

jest.mock('next/image', () => {
  function MockImage({ alt }: { alt: string }) {
    return <img alt={alt} />;
  }
  MockImage.displayName = 'MockImage';
  return MockImage;
});

const reservation = (id: string, title: string, start: string): PanelItem => ({
  id,
  kind: 'reservation',
  experienceId: `e-${id}`,
  title,
  coverPhoto: null,
  start,
  end: '2026-08-29T20:00:00Z',
  priceLabel: 'from KES 1,500',
  reservation: { tickets: [{ id: 't1' }] } as never,
});

const invite = (id: string, title: string, start: string): PanelItem => ({
  id,
  kind: 'invite',
  experienceId: `e-${id}`,
  title,
  coverPhoto: null,
  start,
  end: '2026-08-28T10:00:00Z',
  priceLabel: 'Free',
});

const items = [
  reservation('r1', 'Mt Kenya Base Camp Briefing', '2026-08-27T18:00:00Z'),
  invite('i1', 'Karura Sunday Walkers Meetup', '2026-08-28T07:00:00Z'),
  reservation('r2', 'Gikuyu na Mumbi', '2026-08-29T17:00:00Z'),
];

describe('ReservationCalendarPanel', () => {
  it('defaults to All and lists every booking that month', () => {
    render(<ReservationCalendarPanel items={items} onViewTicket={jest.fn()} />);

    expect(screen.getByRole('button', { name: 'All' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('Mt Kenya Base Camp Briefing')).toBeInTheDocument();
    expect(screen.getByText('Karura Sunday Walkers Meetup')).toBeInTheDocument();
    expect(screen.getByText('Gikuyu na Mumbi')).toBeInTheDocument();
  });

  it('counts the bookings in the month', () => {
    render(<ReservationCalendarPanel items={items} onViewTicket={jest.fn()} />);

    expect(screen.getByText('3 bookings')).toBeInTheDocument();
  });

  it('filters to one day when a day pill is chosen', () => {
    render(<ReservationCalendarPanel items={items} onViewTicket={jest.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: /Fri\s*28/ }));

    expect(screen.getByText('Karura Sunday Walkers Meetup')).toBeInTheDocument();
    expect(screen.queryByText('Mt Kenya Base Camp Briefing')).not.toBeInTheDocument();
  });

  it('distinguishes reservations from invites', () => {
    render(<ReservationCalendarPanel items={items} onViewTicket={jest.fn()} />);

    expect(screen.getAllByText('Reserved')).toHaveLength(2);
    expect(screen.getByText('Invite')).toBeInTheDocument();
  });

  it('offers View ticket on reservations and Accept/Decline on invites', () => {
    render(<ReservationCalendarPanel items={items} onViewTicket={jest.fn()} />);

    expect(screen.getAllByRole('button', { name: /View ticket/ })).toHaveLength(2);
    expect(screen.getByRole('button', { name: 'Accept' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Decline' })).toBeInTheDocument();
  });

  // No accept/decline endpoint exists on the API yet
  it('disables the invite actions until an endpoint exists', () => {
    render(<ReservationCalendarPanel items={items} onViewTicket={jest.fn()} />);

    expect(screen.getByRole('button', { name: 'Accept' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Decline' })).toBeDisabled();
  });

  it('enables the invite actions once they are wired', () => {
    render(<ReservationCalendarPanel items={items} onViewTicket={jest.fn()} invitesActionable />);

    expect(screen.getByRole('button', { name: 'Accept' })).toBeEnabled();
  });

  it('reports which item the ticket was requested for', () => {
    const onViewTicket = jest.fn();
    render(<ReservationCalendarPanel items={items} onViewTicket={onViewTicket} />);

    fireEvent.click(screen.getAllByRole('button', { name: /View ticket/ })[0]);

    expect(onViewTicket).toHaveBeenCalledWith(expect.objectContaining({ id: 'r1' }));
  });

  it('shows the price and time range separated by a bullet', () => {
    render(<ReservationCalendarPanel items={items} onViewTicket={jest.fn()} />);

    // "from KES 1,500  •  9:00 PM - 11:00 PM"
    expect(screen.getAllByText(/from KES 1,500\s+•\s+\d+:\d+ [AP]M - \d+:\d+ [AP]M/)).toHaveLength(
      2,
    );
    expect(screen.getByText(/^Free\s+•\s+/)).toBeInTheDocument();
  });

  it('changes month with the steppers', () => {
    render(<ReservationCalendarPanel items={items} onViewTicket={jest.fn()} />);

    fireEvent.click(screen.getByLabelText('Next month'));

    expect(screen.getByText('September')).toBeInTheDocument();
    expect(screen.getByText('0 bookings')).toBeInTheDocument();
    expect(screen.getByText('Nothing this month')).toBeInTheDocument();
  });
});
