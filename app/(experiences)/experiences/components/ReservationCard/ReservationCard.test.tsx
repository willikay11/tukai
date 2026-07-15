import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ReservationCard } from './index';

const defaultProps = {
  title: 'Gikuyu na Mumbi',
  coverPhoto: '/images/kilimanjaro.webp',
  occurrenceStart: '2026-07-04T06:00:00',
  occurrenceEnd: '2026-07-04T16:00:00',
  communityName: 'Trails And Us',
  ticketCount: 4,
  status: 'completed',
  hasTicketPdf: true,
  onViewTicket: jest.fn(),
};

describe('ReservationCard', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders title, formatted date/time, community and ticket count', () => {
    render(<ReservationCard {...defaultProps} />);

    expect(screen.getByText('Gikuyu na Mumbi')).toBeInTheDocument();
    expect(
      screen.getByText('Sat 4 July · 6:00 AM — 4:00 PM · Trails And Us'),
    ).toBeInTheDocument();
    expect(screen.getByText('4 tickets')).toBeInTheDocument();
  });

  it('shows the Paid badge for a completed purchase', () => {
    render(<ReservationCard {...defaultProps} />);
    expect(screen.getByText('Paid')).toBeInTheDocument();
  });

  it('shows the Expired badge for expired and Partial for partial', () => {
    const { rerender } = render(<ReservationCard {...defaultProps} status="expired" />);
    expect(screen.getByText('Expired')).toBeInTheDocument();

    rerender(<ReservationCard {...defaultProps} status="partial" />);
    expect(screen.getByText('Partial')).toBeInTheDocument();
  });

  it('singularises the ticket count', () => {
    render(<ReservationCard {...defaultProps} ticketCount={1} />);
    expect(screen.getByText('1 ticket')).toBeInTheDocument();
  });

  it('fires onViewTicket and hides the link when no PDF exists', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<ReservationCard {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: 'View ticket' }));
    expect(defaultProps.onViewTicket).toHaveBeenCalled();

    rerender(<ReservationCard {...defaultProps} hasTicketPdf={false} />);
    expect(screen.queryByRole('button', { name: 'View ticket' })).not.toBeInTheDocument();
  });
});
