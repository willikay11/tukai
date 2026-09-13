import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ReservationTicket } from '@/types/ticket-purchase';

import { ReservationCard } from './index';

const tickets: ReservationTicket[] = [
  {
    id: 'p1',
    ticketNumber: 'TKT4TMNVGE4',
    qrCodeImage: 'https://cdn-staging.tukai.co/media/qr1.png',
    hasPdf: true,
    holderName: 'Tony Ouma',
    ticketType: 'Normal',
  },
  {
    id: 'p2',
    ticketNumber: 'TKT03C8PFXX',
    qrCodeImage: 'https://cdn-staging.tukai.co/media/qr2.png',
    hasPdf: true,
    holderName: 'Tony Ouma',
    ticketType: 'Normal',
  },
];

const defaultProps = {
  title: 'Gikuyu na Mumbi',
  coverPhoto: '/images/kilimanjaro.webp',
  occurrenceStart: '2026-07-04T06:00:00',
  occurrenceEnd: '2026-07-04T16:00:00',
  communityName: 'Trails And Us',
  ticketCount: 2,
  status: 'completed',
  tickets,
  shareLink: 'https://tukai.co/experiences/exp-1',
  onDownloadAll: jest.fn(),
};

describe('ReservationCard', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders title, formatted date/time, community and ticket count', () => {
    render(<ReservationCard {...defaultProps} />);

    expect(screen.getByText('Gikuyu na Mumbi')).toBeInTheDocument();
    expect(screen.getByText('Sat 4 July · 6:00 AM — 4:00 PM · Trails And Us')).toBeInTheDocument();
    expect(screen.getByText('2 tickets')).toBeInTheDocument();
  });

  it('shows the Paid badge for a completed purchase', () => {
    render(<ReservationCard {...defaultProps} />);
    expect(screen.getByText('Paid')).toBeInTheDocument();
  });

  it('opens the ticket modal with details, QR and paginator', async () => {
    const user = userEvent.setup();
    render(<ReservationCard {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: 'View ticket' }));

    expect(screen.getByText('Ticket 1 of 2')).toBeInTheDocument();
    expect(screen.getByText('Scan at Entry')).toBeInTheDocument();
    expect(screen.getByText('Ticket Holder')).toBeInTheDocument();
    expect(screen.getAllByText('Tony Ouma').length).toBeGreaterThan(0);
    expect(screen.getAllByText('TKT4TMNVGE4').length).toBeGreaterThan(0);
    expect(screen.getByAltText('QR code for TKT4TMNVGE4')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Download all (2)' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /share/i })).toBeInTheDocument();
  });

  it('paginates to the next ticket and updates the QR + number', async () => {
    const user = userEvent.setup();
    render(<ReservationCard {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: 'View ticket' }));
    await user.click(screen.getByRole('button', { name: 'Next ticket' }));

    expect(screen.getByText('Ticket 2 of 2')).toBeInTheDocument();
    expect(screen.getByAltText('QR code for TKT03C8PFXX')).toBeInTheDocument();
    // Previous is enabled again, next is now disabled
    expect(screen.getByRole('button', { name: 'Previous ticket' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Next ticket' })).toBeDisabled();
  });

  it('shows no paginator for a single-ticket reservation and counts downloadables', async () => {
    const user = userEvent.setup();
    render(
      <ReservationCard
        {...defaultProps}
        ticketCount={1}
        tickets={[{ ...tickets[0], hasPdf: false, qrCodeImage: null }]}
      />,
    );

    expect(screen.getByText('1 ticket')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'View ticket' }));

    expect(screen.queryByText(/Ticket 1 of/)).not.toBeInTheDocument();
    expect(screen.getByText('QR code unavailable for this ticket')).toBeInTheDocument();
    // No downloadable PDFs → button disabled with count 0
    expect(screen.getByRole('button', { name: 'Download all (0)' })).toBeDisabled();
  });

  it('fires onDownloadAll from the modal', async () => {
    const user = userEvent.setup();
    render(<ReservationCard {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: 'View ticket' }));
    await user.click(screen.getByRole('button', { name: 'Download all (2)' }));

    expect(defaultProps.onDownloadAll).toHaveBeenCalled();
  });

  it('does not propagate the View ticket click to a wrapping card link', async () => {
    const user = userEvent.setup();
    const onCardNavigate = jest.fn();

    render(
      <a href="/experiences/exp-1" onClick={onCardNavigate}>
        <ReservationCard {...defaultProps} />
      </a>,
    );

    await user.click(screen.getByRole('button', { name: 'View ticket' }));

    expect(screen.getByText('Ticket 1 of 2')).toBeInTheDocument();
    expect(onCardNavigate).not.toHaveBeenCalled();
  });
});
