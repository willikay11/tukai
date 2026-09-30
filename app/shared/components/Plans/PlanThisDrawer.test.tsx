import React from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Plan } from '@/types/plan';

import { PlanThisDrawer, PlanThisSubject } from './PlanThisDrawer';

const createPlan = jest.fn();
const addStop = jest.fn();
const setPlanDate = jest.fn();
let plans: Plan[] = [];

jest.mock('@/context/PlanContext', () => ({
  usePlans: () => ({ plans, createPlan, addStop, setPlanDate }),
}));

const toast = jest.fn();
jest.mock('@/app/shared/hooks/useToast', () => ({ useToast: () => ({ toast }) }));

const push = jest.fn();
jest.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));

const plan = (overrides: Partial<Plan> = {}): Plan => ({
  id: 'p1',
  title: 'Saturday out',
  date: '2026-07-05',
  stops: [],
  dateCreated: '2026-07-01T00:00:00Z',
  ...overrides,
});

const experience: PlanThisSubject = {
  kind: 'experience',
  refId: 'e1',
  title: 'Sunrise hike',
  subtitle: 'Nairobi',
  refDate: '2026-07-05T06:00:00Z',
};

const place: PlanThisSubject = {
  kind: 'place',
  refId: 'pl1',
  title: 'Karura Forest',
  subtitle: 'Park, Nairobi',
};

const renderDrawer = (subject: PlanThisSubject = experience, onClose = jest.fn()) =>
  render(<PlanThisDrawer subject={subject} isOpen onClose={onClose} />);

describe('planning something', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    plans = [plan()];
    createPlan.mockReturnValue({ id: 'new1', title: 'Plan for 2026-07-05' });
  });

  it('names what is being planned', () => {
    renderDrawer();

    expect(screen.getByText('Sunrise hike')).toBeInTheDocument();
    expect(screen.getByText('Nairobi')).toBeInTheDocument();
  });

  it('lists the plans to add it to, with what is on each', () => {
    renderDrawer();

    expect(screen.getByRole('radio', { name: /Saturday out/ })).toBeInTheDocument();
    expect(screen.getByText('2026-07-05, 0 stops')).toBeInTheDocument();
  });

  it('adds to the chosen plan', async () => {
    renderDrawer();

    await userEvent.click(screen.getByRole('button', { name: 'Add to Saturday out' }));

    expect(addStop).toHaveBeenCalledWith(
      'p1',
      expect.objectContaining({ kind: 'experience', refId: 'e1', title: 'Sunrise hike' }),
    );
  });

  /**
   * The canvas is emphatic about this: "add to plan" beside a ticket price
   * reads like a purchase, so the message says outright that it was not one.
   */
  it('promises that nothing was booked', async () => {
    renderDrawer();

    await userEvent.click(screen.getByRole('button', { name: 'Add to Saturday out' }));

    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Sunrise hike is in Saturday out',
        description: 'Nothing was booked.',
      }),
    );
  });

  it('opens the plan it was added to', async () => {
    renderDrawer();

    await userEvent.click(screen.getByRole('button', { name: 'Add to Saturday out' }));

    expect(push).toHaveBeenCalledWith('/plans/p1');
  });

  it('makes a new plan when asked, named after the day', async () => {
    renderDrawer();

    await userEvent.click(screen.getByRole('radio', { name: /New plan/ }));
    await userEvent.click(screen.getByRole('button', { name: 'Create and add' }));

    expect(createPlan).toHaveBeenCalledWith('Plan for 2026-07-05');
    expect(addStop).toHaveBeenCalledWith('new1', expect.objectContaining({ refId: 'e1' }));
  });

  it('takes a name for the new plan', async () => {
    renderDrawer();

    await userEvent.click(screen.getByRole('radio', { name: /New plan/ }));
    await userEvent.type(screen.getByLabelText('Call it'), 'Hike day');
    await userEvent.click(screen.getByRole('button', { name: 'Create and add' }));

    expect(createPlan).toHaveBeenCalledWith('Hike day');
  });

  // A plan built around an experience is on that experience's day
  it('dates a new plan from the experience', async () => {
    renderDrawer();

    await userEvent.click(screen.getByRole('radio', { name: /New plan/ }));
    await userEvent.click(screen.getByRole('button', { name: 'Create and add' }));

    expect(setPlanDate).toHaveBeenCalledWith('new1', '2026-07-05');
  });

  it('starts on a new plan when there are none', () => {
    plans = [];
    renderDrawer();

    expect(screen.getByRole('button', { name: 'Create and add' })).toBeInTheDocument();
  });

  it('will not add the same thing twice', async () => {
    plans = [
      plan({ stops: [{ id: 's1', kind: 'experience', refId: 'e1', title: 'Sunrise hike' }] }),
    ];
    renderDrawer();

    expect(screen.getByText('Already in Saturday out.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Already in this plan' })).toBeDisabled();
  });

  it('warns when the experience runs on another day', () => {
    renderDrawer({ ...experience, refDate: '2026-07-12T06:00:00Z' });

    expect(screen.getByRole('alert')).toHaveTextContent('This runs on 2026-07-12');
  });

  // The host sets an experience's time, so there is nothing to choose
  it('offers no time for an experience, and says why', () => {
    renderDrawer();

    expect(screen.getByText(/The host sets the time/)).toBeInTheDocument();
    expect(screen.queryByRole('radio', { name: 'Morning' })).not.toBeInTheDocument();
  });

  it('asks when in the day a place should go', async () => {
    renderDrawer(place);

    expect(screen.getByRole('radio', { name: 'Midday' })).toBeChecked();

    await userEvent.click(screen.getByRole('radio', { name: 'Morning' }));
    await userEvent.click(screen.getByRole('button', { name: 'Add to Saturday out' }));

    expect(addStop).toHaveBeenCalledWith('p1', expect.objectContaining({ time: '09:00' }));
  });
});
