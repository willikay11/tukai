import React from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Experience } from '@/types/experience';

import { SalesDeadlineSection } from './index';

const updateExperience = jest.fn();
jest.mock('@/app/shared/hooks/useExperiences', () => ({
  useUpdateExperience: () => ({ mutate: updateExperience, isPending: false }),
}));

const toast = jest.fn();
jest.mock('@/app/shared/hooks/useToast', () => ({ useToast: () => ({ toast }) }));

const experience = (overrides: Partial<Experience> = {}): Experience =>
  ({
    id: 'e1',
    title: 'Sunrise hike',
    description: 'Up early',
    startDate: '2026-07-05T07:00:00Z',
    endDate: '2026-07-05T12:00:00Z',
    ticketSalesClosingDuration: 1,
    ticketSalesClosingUnit: 'days',
    ticketSalesClosingCondition: 'before_start',
    ...overrides,
  }) as unknown as Experience;

describe('the sales deadline', () => {
  beforeEach(() => jest.clearAllMocks());

  it('reads the setting back in words and as a date', () => {
    render(<SalesDeadlineSection experience={experience()} />);

    expect(screen.getByText('1 day before the experience starts')).toBeInTheDocument();
    expect(screen.getByText(/^Sales close /)).toBeInTheDocument();
  });

  // A value set in the create flow or on mobile need not be one of the three
  it('reads back a setting that is none of the three choices', () => {
    render(
      <SalesDeadlineSection
        experience={experience({ ticketSalesClosingDuration: 3, ticketSalesClosingUnit: 'hours' })}
      />,
    );

    expect(screen.getByText('3 hours before the experience starts')).toBeInTheDocument();
  });

  it('says plainly when no deadline is set', () => {
    render(
      <SalesDeadlineSection experience={experience({ ticketSalesClosingDuration: undefined })} />,
    );

    expect(screen.getByText('Not set')).toBeInTheDocument();
  });

  it('offers the three choices the canvas gives when editing', async () => {
    render(<SalesDeadlineSection experience={experience()} />);

    await userEvent.click(screen.getByRole('button', { name: 'Edit' }));

    expect(screen.getAllByRole('radio')).toHaveLength(3);
    expect(screen.getByRole('radio', { name: '1 day before the experience starts' })).toBeChecked();
  });

  it('saves the chosen deadline', async () => {
    render(<SalesDeadlineSection experience={experience()} />);

    await userEvent.click(screen.getByRole('button', { name: 'Edit' }));
    await userEvent.click(screen.getByRole('radio', { name: '1 hour before the experience ends' }));
    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(updateExperience).toHaveBeenCalledWith(
      expect.objectContaining({
        ticketSalesClosingDuration: 1,
        ticketSalesClosingUnit: 'hours',
        ticketSalesClosingCondition: 'before_end',
      }),
      expect.anything(),
    );
  });

  // The PATCH requires these three whether or not they changed
  it('sends the fields the API insists on', async () => {
    render(<SalesDeadlineSection experience={experience({ recurrenceRule: 'FREQ=WEEKLY' })} />);

    await userEvent.click(screen.getByRole('button', { name: 'Edit' }));
    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(updateExperience).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Sunrise hike',
        description: 'Up early',
        recurrence_rule: 'FREQ=WEEKLY',
      }),
      expect.anything(),
    );
  });

  it('leaves the setting alone when the edit is cancelled', async () => {
    render(<SalesDeadlineSection experience={experience()} />);

    await userEvent.click(screen.getByRole('button', { name: 'Edit' }));
    await userEvent.click(screen.getByRole('radio', { name: '1 hour before the experience ends' }));
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(updateExperience).not.toHaveBeenCalled();
    expect(screen.getByText('1 day before the experience starts')).toBeInTheDocument();
  });

  it('reports a refusal rather than looking like it saved', async () => {
    updateExperience.mockImplementation((_data, { onError }) =>
      onError({ message: 'Experience has ended' }),
    );
    render(<SalesDeadlineSection experience={experience()} />);

    await userEvent.click(screen.getByRole('button', { name: 'Edit' }));
    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({ description: 'Experience has ended', variant: 'destructive' }),
    );
  });
});
