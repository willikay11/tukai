import React from 'react';

import { fireEvent, render, screen } from '@testing-library/react';

import { ReservationCalendarPanel } from './ReservationCalendarPanel';
import { ReservationView } from './types';

jest.mock('next/image', () => {
  function MockImage({ alt }: { alt: string }) {
    return <img alt={alt} />;
  }
  MockImage.displayName = 'MockImage';
  return MockImage;
});

const view = (key: string, title: string, start: string): ReservationView =>
  ({
    key,
    experienceId: `e-${key}`,
    title,
    coverPhoto: null,
    communityName: null,
    start,
    end: '2026-08-29T16:00:00Z',
    status: 'completed',
    ticketCount: 1,
    tickets: [{ id: 't1' }],
    priceAmount: 20000,
    currency: 'KES',
  }) as ReservationView;

const reservations = [
  view('a', 'Mount Kenya Hike', '2026-08-29T06:00:00Z'),
  view('b', 'Lamu Sail', '2026-08-30T06:00:00Z'),
];

describe('ReservationCalendarPanel', () => {
  it('opens on the month of the soonest reservation', () => {
    render(<ReservationCalendarPanel reservations={reservations} onViewTicket={jest.fn()} />);

    expect(screen.getByText('August')).toBeInTheDocument();
  });

  it('defaults to the first day that has reservations', () => {
    render(<ReservationCalendarPanel reservations={reservations} onViewTicket={jest.fn()} />);

    expect(screen.getByText('Mount Kenya Hike')).toBeInTheDocument();
    expect(screen.queryByText('Lamu Sail')).not.toBeInTheDocument();
  });

  it('filters the list when another day is selected', () => {
    render(<ReservationCalendarPanel reservations={reservations} onViewTicket={jest.fn()} />);

    // The 29th strip also holds the 30th
    fireEvent.click(screen.getByRole('button', { name: /Sun\s*30/ }));

    expect(screen.getByText('Lamu Sail')).toBeInTheDocument();
    expect(screen.queryByText('Mount Kenya Hike')).not.toBeInTheDocument();
  });

  it('shows an empty state for a day with nothing on it', () => {
    render(<ReservationCalendarPanel reservations={reservations} onViewTicket={jest.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: /Mon\s*31/ }));

    expect(screen.getByText('Nothing on this day')).toBeInTheDocument();
  });

  it('changes month with the steppers', () => {
    render(<ReservationCalendarPanel reservations={reservations} onViewTicket={jest.fn()} />);

    fireEvent.click(screen.getByLabelText('Next month'));
    expect(screen.getByText('September')).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Previous month'));
    expect(screen.getByText('August')).toBeInTheDocument();
  });

  it('reports the reservation whose ticket was requested', () => {
    const onViewTicket = jest.fn();
    render(<ReservationCalendarPanel reservations={reservations} onViewTicket={onViewTicket} />);

    fireEvent.click(screen.getByRole('button', { name: /View ticket/ }));

    expect(onViewTicket).toHaveBeenCalledWith(expect.objectContaining({ key: 'a' }));
  });

  it('renders the date chip for the row', () => {
    render(<ReservationCalendarPanel reservations={reservations} onViewTicket={jest.fn()} />);

    expect(screen.getByText('Aug')).toBeInTheDocument();
  });
});
