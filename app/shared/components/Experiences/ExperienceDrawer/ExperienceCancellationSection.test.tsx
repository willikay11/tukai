import React from 'react';

import { render, screen } from '@testing-library/react';

import { Experience } from '@/types/experience';

import { ExperienceCancellationSection } from './ExperienceCancellationSection';

const experience = (overrides: Partial<Experience> = {}) =>
  ({
    id: 'exp-1',
    ...overrides,
  }) as unknown as Experience;

describe('ExperienceCancellationSection', () => {
  it('states the ticket sales closing window before the experience starts', () => {
    render(
      <ExperienceCancellationSection
        experience={experience({
          ticketSalesClosingDuration: 3,
          ticketSalesClosingUnit: 'days',
          ticketSalesClosingCondition: 'before_start',
        })}
      />,
    );

    expect(
      screen.getByText('Ticket sales close 3 days before the experience starts.'),
    ).toBeInTheDocument();
  });

  it('drops the plural unit for a single hour', () => {
    render(
      <ExperienceCancellationSection
        experience={experience({
          ticketSalesClosingDuration: 1,
          ticketSalesClosingUnit: 'hours',
          ticketSalesClosingCondition: 'before_end',
        })}
      />,
    );

    expect(
      screen.getByText('Ticket sales close 1 hour before the experience ends.'),
    ).toBeInTheDocument();
  });

  it('leaves out the policy text when the experience has no closing window', () => {
    render(<ExperienceCancellationSection experience={experience({})} />);

    expect(screen.queryByText('Cancellation policy')).not.toBeInTheDocument();
  });

  it('always offers to report the experience', () => {
    render(<ExperienceCancellationSection experience={experience({})} />);

    expect(screen.getByRole('button', { name: /Report this experience/ })).toBeInTheDocument();
  });
});
