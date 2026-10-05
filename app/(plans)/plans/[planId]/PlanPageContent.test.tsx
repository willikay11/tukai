import React from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Plan } from '@/types/plan';

import { PlanPageContent } from './PlanPageContent';

const store = {
  plans: [] as Plan[],
  isReady: true,
  renamePlan: jest.fn(),
  setPlanDate: jest.fn(),
  deletePlan: jest.fn(),
  updateStop: jest.fn(),
  removeStop: jest.fn(),
  reorderStops: jest.fn(),
  sortStopsByTime: jest.fn(),
};

jest.mock('@/context/PlanContext', () => ({ usePlans: () => store }));

const toast = jest.fn();
jest.mock('@/app/shared/hooks/useToast', () => ({ useToast: () => ({ toast }) }));

const push = jest.fn();
jest.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));

// Adding a stop has its own tests; here it only matters that it can be opened
jest.mock('./components/AddStopDrawer', () => ({ AddStopDrawer: () => null }));

const plan = (overrides: Partial<Plan> = {}): Plan => ({
  id: 'p1',
  title: 'Saturday out',
  date: '2026-07-05',
  stops: [
    { id: 's1', kind: 'place', title: 'Karura Forest', time: '09:00', durationMinutes: 90 },
    { id: 's2', kind: 'experience', title: 'Sunset hike', time: '17:00', refId: 'e1' },
  ],
  dateCreated: '2026-07-01T00:00:00Z',
  ...overrides,
});

describe('one plan', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    store.plans = [plan()];
    store.isReady = true;
  });

  it('is headed by its name, and lists its stops in order', () => {
    render(<PlanPageContent planId="p1" />);

    expect(screen.getByRole('heading', { name: 'Saturday out' })).toBeInTheDocument();
    expect(screen.getByText('Karura Forest')).toBeInTheDocument();
    expect(screen.getByText('9:00 AM - 10:30 AM')).toBeInTheDocument();
  });

  it('renames a plan', async () => {
    render(<PlanPageContent planId="p1" />);

    await userEvent.click(screen.getByRole('button', { name: 'Rename this plan' }));
    await userEvent.clear(screen.getByLabelText('Plan name'));
    await userEvent.type(screen.getByLabelText('Plan name'), 'Sunday out');
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(store.renamePlan).toHaveBeenCalledWith('p1', 'Sunday out');
  });

  it('keeps the old name where the field was emptied', async () => {
    render(<PlanPageContent planId="p1" />);

    await userEvent.click(screen.getByRole('button', { name: 'Rename this plan' }));
    await userEvent.clear(screen.getByLabelText('Plan name'));
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(store.renamePlan).toHaveBeenCalledWith('p1', 'Saturday out');
  });

  it('changes the time at a stop', async () => {
    render(<PlanPageContent planId="p1" />);

    const field = screen.getByLabelText('Time at Karura Forest');
    await userEvent.clear(field);
    await userEvent.type(field, '11:00');

    expect(store.updateStop).toHaveBeenCalledWith('p1', 's1', expect.objectContaining({}));
  });

  it('changes how long a stop takes', async () => {
    render(<PlanPageContent planId="p1" />);

    await userEvent.selectOptions(screen.getByLabelText('How long at Karura Forest'), '120');

    expect(store.updateStop).toHaveBeenCalledWith('p1', 's1', { durationMinutes: 120 });
  });

  it('removes a stop', async () => {
    render(<PlanPageContent planId="p1" />);

    await userEvent.click(screen.getByRole('button', { name: 'Remove Karura Forest' }));

    expect(store.removeStop).toHaveBeenCalledWith('p1', 's1');
  });

  it('moves a stop up', async () => {
    render(<PlanPageContent planId="p1" />);

    await userEvent.click(screen.getByRole('button', { name: 'Move Sunset hike up' }));

    expect(store.reorderStops).toHaveBeenCalledWith('p1', 1, 0);
  });

  // The first stop has nothing above it and the last nothing below
  it('does not offer to move the first stop up', () => {
    render(<PlanPageContent planId="p1" />);

    expect(screen.getByRole('button', { name: 'Move Karura Forest up' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Move Sunset hike down' })).toBeDisabled();
  });

  it('sorts the day by time', async () => {
    render(<PlanPageContent planId="p1" />);

    await userEvent.click(screen.getByRole('button', { name: 'Sort by time' }));

    expect(store.sortStopsByTime).toHaveBeenCalledWith('p1');
  });

  it('does not offer to sort one stop', () => {
    store.plans = [plan({ stops: [plan().stops[0]] })];
    render(<PlanPageContent planId="p1" />);

    expect(screen.queryByRole('button', { name: 'Sort by time' })).not.toBeInTheDocument();
  });

  it('flags a stop that clashes with the one above it', () => {
    store.plans = [
      plan({
        stops: [
          { id: 's1', kind: 'place', title: 'Lunch', time: '14:00', durationMinutes: 120 },
          { id: 's2', kind: 'place', title: 'Karura', time: '15:00' },
        ],
      }),
    ];
    render(<PlanPageContent planId="p1" />);

    expect(screen.getByText('Starts before Lunch ends at 4:00 PM.')).toBeInTheDocument();
    expect(screen.getByText('1 stop needs a look.')).toBeInTheDocument();
  });

  it('opens the experience behind a stop', async () => {
    render(<PlanPageContent planId="p1" />);

    await userEvent.click(screen.getByRole('button', { name: 'Sunset hike' }));

    expect(push).toHaveBeenCalledWith('/experiences/e1');
  });

  // A stop the reader invented is not on Tukai, so there is nowhere to open
  it('does not link a stop the reader invented', () => {
    store.plans = [plan({ stops: [{ id: 's1', kind: 'custom', title: 'Coffee' }] })];
    render(<PlanPageContent planId="p1" />);

    expect(screen.queryByRole('button', { name: 'Coffee' })).not.toBeInTheDocument();
  });

  /**
   * Plans hold references, not bookings — the canvas says this outright when
   * one is deleted.
   */
  it('promises that deleting a plan cancels nothing', async () => {
    render(<PlanPageContent planId="p1" />);

    await userEvent.click(screen.getByRole('button', { name: 'Delete this plan' }));

    expect(store.deletePlan).toHaveBeenCalledWith('p1');
    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({ description: 'Nothing you booked was cancelled.' }),
    );
    expect(push).toHaveBeenCalledWith('/plans');
  });

  it('says plainly when a plan is not on this device', () => {
    store.plans = [];
    render(<PlanPageContent planId="p1" />);

    expect(
      screen.getByText(
        'This plan is not on this device. Plans are kept in the browser they were made in.',
      ),
    ).toBeInTheDocument();
  });

  it('says nothing at all until the store has looked', () => {
    store.plans = [];
    store.isReady = false;
    render(<PlanPageContent planId="p1" />);

    expect(screen.queryByText(/not on this device/)).not.toBeInTheDocument();
  });

  it('says what to do with an empty plan', () => {
    store.plans = [plan({ stops: [] })];
    render(<PlanPageContent planId="p1" />);

    // Once in the meta line, once as the empty state telling them where to add
    expect(screen.getByText(/Add one here, or from any experience or place/)).toBeInTheDocument();
  });
});
