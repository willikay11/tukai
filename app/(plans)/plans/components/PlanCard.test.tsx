import React from 'react';

import { render, screen } from '@testing-library/react';
import moment from 'moment';

import { Plan } from '@/types/plan';

import { PlanCard, planStatus } from './PlanCard';

const plan = (overrides: Partial<Plan> = {}): Plan => ({
  id: 'p1',
  title: 'Saturday out',
  date: null,
  stops: [],
  dateCreated: '2026-07-01T00:00:00Z',
  ...overrides,
});

const NOW = moment('2026-07-05T08:00:00Z');

describe('planStatus', () => {
  it('calls a plan with no day a draft', () => {
    expect(planStatus(plan(), NOW)).toBe('Draft');
  });

  it('names today and tomorrow', () => {
    expect(planStatus(plan({ date: '2026-07-05' }), NOW)).toBe('Today');
    expect(planStatus(plan({ date: '2026-07-06' }), NOW)).toBe('Tomorrow');
  });

  it('gives the date for anything further out', () => {
    expect(planStatus(plan({ date: '2026-07-12' }), NOW)).toBe('Sun 12 Jul');
  });

  // A date that cannot be read is no date at all
  it('falls back to a draft on a date it cannot read', () => {
    expect(planStatus(plan({ date: 'someday' }), NOW)).toBe('Draft');
  });
});

describe('a plan card', () => {
  it('names the plan and what is on it', () => {
    render(
      <PlanCard
        plan={plan({
          stops: [{ id: 's1', kind: 'place', title: 'Karura', time: '09:00' }],
        })}
        onOpen={jest.fn()}
      />,
    );

    expect(screen.getByText('Saturday out')).toBeInTheDocument();
    expect(screen.getByText('1 stop, from 9:00 AM')).toBeInTheDocument();
  });

  it('says a plan with nothing on it has nothing on it', () => {
    render(<PlanCard plan={plan()} onOpen={jest.fn()} />);

    expect(screen.getByText('No stops yet')).toBeInTheDocument();
  });

  it('counts the stops that need a look', () => {
    render(
      <PlanCard
        plan={plan({
          date: '2026-07-05',
          stops: [
            { id: 's1', kind: 'place', title: 'Lunch', time: '14:00' },
            { id: 's2', kind: 'place', title: 'Karura', time: '09:00' },
          ],
        })}
        onOpen={jest.fn()}
      />,
    );

    expect(screen.getByText('1 stop needs a look')).toBeInTheDocument();
  });

  it('says nothing about warnings when there are none', () => {
    render(<PlanCard plan={plan()} onOpen={jest.fn()} />);

    expect(screen.queryByText(/needs a look/)).not.toBeInTheDocument();
  });
});
