import React from 'react';

import { fireEvent, render, screen } from '@testing-library/react';

import { UpcomingReservationCard } from './UpcomingReservationCard';
import { ExperienceReservationView } from './types';

jest.mock('../TicketModal', () => ({
  TicketModal: ({ isOpen, experienceTitle }: { isOpen: boolean; experienceTitle: string }) =>
    isOpen ? <div>ticket modal: {experienceTitle}</div> : null,
}));
jest.mock('next/image', () => {
  function MockImage({ alt, src }: Record<string, unknown>) {
    return <img alt={alt as string} src={src as string} />;
  }
  MockImage.displayName = 'MockImage';
  return MockImage;
});

const makeView = (overrides: Partial<ExperienceReservationView> = {}): ExperienceReservationView =>
  ({
    key: 'k1',
    experienceId: 'e1',
    title: 'Mount Kenya Hike',
    coverPhoto: 'https://cdn.tukai.co/a.jpg',
    communityName: 'Trails And Us',
    start: '2026-08-29T06:00:00Z',
    end: '2026-08-29T16:00:00Z',
    status: 'completed',
    ticketCount: 2,
    tickets: [{ id: 't1' }],
    paidAmount: 20000,
    currency: 'KES',
    ...overrides,
  }) as ExperienceReservationView;

const defaults = { shareLink: 'https://tukai.co/e/1', onDownloadAll: jest.fn() };

describe('UpcomingReservationCard', () => {
  // The amount is what this user paid, from reserved_tickets_amount — not the
  // experience's from-price
  it('shows title, amount paid with ticket count, and the date range', () => {
    render(<UpcomingReservationCard {...defaults} reservation={makeView()} />);

    expect(screen.getByText('Mount Kenya Hike')).toBeInTheDocument();
    expect(screen.getByText(/KES 20,000 · 2 tickets/)).toBeInTheDocument();
    expect(screen.getByText(/29 August/)).toBeInTheDocument();
  });

  it('singularises a single ticket', () => {
    render(<UpcomingReservationCard {...defaults} reservation={makeView({ ticketCount: 1 })} />);

    expect(screen.getByText(/· 1 ticket$/)).toBeInTheDocument();
  });

  it('uses the settled basket icon on a white circle when paid', () => {
    render(<UpcomingReservationCard {...defaults} reservation={makeView()} />);

    expect(screen.getByTestId('ShoppingBasketCheckIn01Icon')).toBeInTheDocument();
    expect(screen.queryByTestId('ShoppingBasketAdd01Icon')).not.toBeInTheDocument();
  });

  it.each(['pending', 'partial', 'expired'])(
    'uses the add-to-basket icon when status is %s',
    (status) => {
      render(<UpcomingReservationCard {...defaults} reservation={makeView({ status })} />);

      expect(screen.getByTestId('ShoppingBasketAdd01Icon')).toBeInTheDocument();
      expect(screen.queryByTestId('ShoppingBasketCheckIn01Icon')).not.toBeInTheDocument();
    },
  );

  it('opens the existing ticket modal from View ticket', () => {
    render(<UpcomingReservationCard {...defaults} reservation={makeView()} />);

    expect(screen.queryByText(/ticket modal/)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /View ticket/ }));
    expect(screen.getByText('ticket modal: Mount Kenya Hike')).toBeInTheDocument();
  });

  it('hides View ticket when the reservation has no tickets', () => {
    render(<UpcomingReservationCard {...defaults} reservation={makeView({ tickets: [] })} />);

    expect(screen.queryByRole('button', { name: /View ticket/ })).not.toBeInTheDocument();
  });

  it('omits the amount line when the API reported none', () => {
    render(
      <UpcomingReservationCard
        {...defaults}
        reservation={makeView({ paidAmount: null, currency: null })}
      />,
    );

    expect(screen.queryByText(/KES/)).not.toBeInTheDocument();
  });
});
