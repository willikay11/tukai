import { render, screen } from '@testing-library/react';

import { Experience } from '@/types/experience';

import { HostingCard } from './index';

const baseExperience = {
  id: 'exp-1',
  title: 'Gikuyu na Mumbi',
  // API returns statuses lowercase
  status: 'published',
  startDate: '2026-07-04T06:00:00',
  endDate: '2026-07-04T16:00:00',
  location: { city: 'Nairobi' },
  photos: [],
  reservedTicketsCount: 34,
  ticketsAvailable: 6,
  dateCreated: '2026-07-01T10:00:00Z',
} as unknown as Experience;

describe('HostingCard', () => {
  it('renders a Live badge, date meta and tickets-sold footer for published', () => {
    render(<HostingCard experience={baseExperience} />);

    expect(screen.getByText('Live')).toBeInTheDocument();
    expect(screen.getByText('Nairobi · Sat 4 July · 6:00 AM')).toBeInTheDocument();
    expect(screen.getByText('34 / 40 tickets sold')).toBeInTheDocument();
  });

  it('routes Manage to the detail page for published experiences', () => {
    render(<HostingCard experience={baseExperience} />);
    expect(screen.getByRole('link', { name: 'Manage' })).toHaveAttribute(
      'href',
      '/experiences/exp-1',
    );
  });

  it('renders Draft badge, Not published meta, created-ago footer and editor routing', () => {
    render(
      <HostingCard
        experience={{ ...baseExperience, status: 'draft' } as unknown as Experience}
      />,
    );

    expect(screen.getByText('Draft')).toBeInTheDocument();
    expect(screen.getByText('Nairobi · Not published')).toBeInTheDocument();
    expect(screen.getByText(/^Created .* ago$/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Manage' })).toHaveAttribute(
      'href',
      '/experiences/create?experienceId=exp-1',
    );
  });

  it('renders Cancelled badge with hidden-from-explore footer and detail routing', () => {
    render(
      <HostingCard
        experience={{ ...baseExperience, status: 'cancelled' } as unknown as Experience}
      />,
    );

    expect(screen.getByText('Cancelled')).toBeInTheDocument();
    expect(screen.getByText('Nairobi · Cancelled')).toBeInTheDocument();
    expect(screen.getByText('Hidden from Explore')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Manage' })).toHaveAttribute(
      'href',
      '/experiences/exp-1',
    );
  });

  it('shows a no-tickets footer when a published experience has no tickets', () => {
    render(
      <HostingCard
        experience={
          {
            ...baseExperience,
            reservedTicketsCount: 0,
            ticketsAvailable: 0,
          } as unknown as Experience
        }
      />,
    );

    expect(screen.getByText('No tickets yet')).toBeInTheDocument();
  });
});
