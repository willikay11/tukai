import React from 'react';

import { render, screen } from '@testing-library/react';

import { Experience } from '@/types/experience';

import { ExperienceTicketsSection } from './ExperienceTicketsSection';

const experience = (tickets: Experience['tickets']) =>
  ({
    id: 'exp-1',
    slug: 'pottery',
    currency: 'KES',
    tickets,
  }) as unknown as Experience;

describe('ExperienceTicketsSection', () => {
  it('shows one pill per ticket type with its buyer price', () => {
    render(
      <ExperienceTicketsSection
        experience={experience([
          { id: 't1', name: 'Standard', price: 1500, quantity: 10 } as never,
          { id: 't2', name: 'VIP', price: 3000, quantity: 5 } as never,
        ])}
      />,
    );

    expect(screen.getByText('Standard')).toBeInTheDocument();
    expect(screen.getByText('KES 1,500')).toBeInTheDocument();
    expect(screen.getByText('VIP')).toBeInTheDocument();
    expect(screen.getByText('KES 3,000')).toBeInTheDocument();
  });

  // The drawer stays a summary: tapping a ticket sends the reader to the
  // full page to book, the same destination the footer already links to
  it('sends every ticket pill to the experience page, not a picker of its own', () => {
    render(
      <ExperienceTicketsSection
        experience={experience([{ id: 't1', name: 'Standard', price: 1500, quantity: 10 } as never])}
      />,
    );

    expect(screen.getByRole('link', { name: /Standard/ })).toHaveAttribute(
      'href',
      '/experiences/pottery',
    );
  });

  it('hides a ticket type whose sales are paused', () => {
    render(
      <ExperienceTicketsSection
        experience={experience([
          { id: 't1', name: 'Standard', price: 1500, quantity: 10, ticketSalesPausedAt: '2026-01-01' } as never,
        ])}
      />,
    );

    expect(screen.queryByText('Standard')).not.toBeInTheDocument();
  });

  it('renders nothing when the experience has no ticket types', () => {
    const { container } = render(<ExperienceTicketsSection experience={experience([])} />);

    expect(container).toBeEmptyDOMElement();
  });
});
