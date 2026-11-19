import React from 'react';

import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { PLAN_STORAGE_KEY } from '@/types/plan';

import { PLAN_SAVE_DELAY_MS, PlanProvider, usePlans } from './PlanContext';

let mockSession: { data: unknown; status: string } = { data: null, status: 'unauthenticated' };
jest.mock('next-auth/react', () => ({ useSession: () => mockSession }));
jest.mock('@/app/shared/hooks/useToast', () => ({ toast: jest.fn() }));

const fetchPlans = jest.fn();
const createPlanOnServer = jest.fn();
const savePlanOnServer = jest.fn();
const deletePlanOnServer = jest.fn();
jest.mock('@/services/plans', () => ({
  fetchPlans: (...args: unknown[]) => fetchPlans(...args),
  createPlanOnServer: (...args: unknown[]) => createPlanOnServer(...args),
  savePlanOnServer: (...args: unknown[]) => savePlanOnServer(...args),
  deletePlanOnServer: (...args: unknown[]) => deletePlanOnServer(...args),
}));

/**
 * The plan store. Signed out (most of these), plans are kept in this
 * browser; signed in they're the account's (DEV-376, at the bottom).
 */
const Probe = () => {
  const {
    plans,
    isReady,
    createPlan,
    addStop,
    updateStop,
    removeStop,
    reorderStops,
    sortStopsByTime,
    renamePlan,
    setPlanDate,
    deletePlan,
  } = usePlans();

  const plan = plans[0];

  return (
    <div>
      <p data-testid="ready">{String(isReady)}</p>
      <p data-testid="count">{plans.length}</p>
      <p data-testid="title">{plan?.title ?? '-'}</p>
      <p data-testid="date">{plan?.date ?? '-'}</p>
      <p data-testid="stops">{(plan?.stops ?? []).map((one) => one.title).join(',')}</p>
      <p data-testid="durations">
        {(plan?.stops ?? []).map((one) => one.durationMinutes).join(',')}
      </p>

      <button onClick={() => createPlan()}>create</button>
      <button onClick={() => createPlan('Named')}>create named</button>
      <button onClick={() => addStop(plan.id, { kind: 'place', title: 'Karura', time: '13:00' })}>
        add place
      </button>
      <button onClick={() => addStop(plan.id, { kind: 'custom', title: 'Coffee', time: '09:00' })}>
        add custom
      </button>
      <button onClick={() => updateStop(plan.id, plan.stops[0]?.id, { time: '16:00' })}>
        retime
      </button>
      <button onClick={() => removeStop(plan.id, plan.stops[0]?.id)}>remove stop</button>
      <button onClick={() => reorderStops(plan.id, 1, 0)}>move up</button>
      <button onClick={() => sortStopsByTime(plan.id)}>sort</button>
      <button onClick={() => renamePlan(plan.id, 'Sunday out')}>rename</button>
      <button onClick={() => setPlanDate(plan.id, '2026-07-05')}>set date</button>
      <button onClick={() => deletePlan(plan.id)}>delete</button>
    </div>
  );
};

const renderStore = () =>
  render(
    <PlanProvider>
      <Probe />
    </PlanProvider>,
  );

const press = (name: string) => userEvent.click(screen.getByRole('button', { name }));

describe('the plan store', () => {
  beforeEach(() => {
    window.localStorage.clear();
    mockSession = { data: null, status: 'unauthenticated' };
  });

  it('starts with nothing, and says when it has looked', () => {
    renderStore();

    expect(screen.getByTestId('ready')).toHaveTextContent('true');
    expect(screen.getByTestId('count')).toHaveTextContent('0');
  });

  it('makes a plan', async () => {
    renderStore();

    await press('create');

    expect(screen.getByTestId('count')).toHaveTextContent('1');
    expect(screen.getByTestId('title')).toHaveTextContent('New plan');
  });

  it('takes a name when it is given one', async () => {
    renderStore();

    await press('create named');

    expect(screen.getByTestId('title')).toHaveTextContent('Named');
  });

  it('renames and dates a plan', async () => {
    renderStore();

    await press('create');
    await press('rename');
    await press('set date');

    expect(screen.getByTestId('title')).toHaveTextContent('Sunday out');
    expect(screen.getByTestId('date')).toHaveTextContent('2026-07-05');
  });

  it('adds stops, and gives each the length its kind usually takes', async () => {
    renderStore();

    await press('create');
    await press('add place');
    await press('add custom');

    expect(screen.getByTestId('stops')).toHaveTextContent('Karura,Coffee');
    expect(screen.getByTestId('durations')).toHaveTextContent('90,30');
  });

  it('retimes and removes a stop', async () => {
    renderStore();

    await press('create');
    await press('add place');
    await press('retime');
    await press('remove stop');

    expect(screen.getByTestId('stops')).toHaveTextContent('');
  });

  it('reorders the stops', async () => {
    renderStore();

    await press('create');
    await press('add place');
    await press('add custom');
    await press('move up');

    expect(screen.getByTestId('stops')).toHaveTextContent('Coffee,Karura');
  });

  it('sorts the day by time', async () => {
    renderStore();

    await press('create');
    await press('add place');
    await press('add custom');
    await press('sort');

    // Coffee at 09:00 comes before Karura at 13:00
    expect(screen.getByTestId('stops')).toHaveTextContent('Coffee,Karura');
  });

  it('deletes a plan', async () => {
    renderStore();

    await press('create');
    await press('delete');

    expect(screen.getByTestId('count')).toHaveTextContent('0');
  });

  it('keeps the plans across a reload', async () => {
    const first = renderStore();

    await press('create');
    await press('add place');
    first.unmount();

    renderStore();

    expect(screen.getByTestId('count')).toHaveTextContent('1');
    expect(screen.getByTestId('stops')).toHaveTextContent('Karura');
  });

  // A half-written value should not cost the reader the whole page
  it('survives rubbish in storage', () => {
    window.localStorage.setItem(PLAN_STORAGE_KEY, '{not json');

    renderStore();

    expect(screen.getByTestId('count')).toHaveTextContent('0');
  });

  it('survives a stored plan missing its stops', () => {
    window.localStorage.setItem(PLAN_STORAGE_KEY, JSON.stringify([{ id: 'p1' }]));

    renderStore();

    expect(screen.getByTestId('count')).toHaveTextContent('1');
    expect(screen.getByTestId('title')).toHaveTextContent('New plan');
  });

  it('refuses to be used outside the provider', () => {
    const quiet = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => render(<Probe />)).toThrow('usePlans must be used inside a PlanProvider');

    quiet.mockRestore();
  });
});

// DEV-376: signed in, plans live on the server, on every device
describe('the plan store, signed in', () => {
  const serverPlan = {
    id: 'srv-1',
    title: 'Saturday out',
    date: '2026-07-04',
    stops: [{ id: 's1', kind: 'custom', title: 'Coffee', time: '09:00', durationMinutes: 30 }],
    dateCreated: '2026-07-01T09:00:00Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    window.localStorage.clear();
    mockSession = { data: { user: { id: 'u1' } }, status: 'authenticated' };
    fetchPlans.mockResolvedValue([serverPlan]);
    savePlanOnServer.mockResolvedValue(undefined);
    deletePlanOnServer.mockResolvedValue(undefined);
  });

  it('reads the account’s plans', async () => {
    renderStore();

    expect(await screen.findByText('Saturday out')).toBeInTheDocument();
    expect(screen.getByTestId('ready')).toHaveTextContent('true');
    expect(screen.getByTestId('stops')).toHaveTextContent('Coffee');
  });

  it('makes a new plan on the server', async () => {
    fetchPlans.mockResolvedValue([]);
    createPlanOnServer.mockResolvedValue({ ...serverPlan, id: 'srv-2', title: 'Named', stops: [] });
    renderStore();
    await screen.findByText('true');

    await press('create named');

    expect(createPlanOnServer).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Named', stops: [] }),
      expect.any(String),
    );
    expect(await screen.findByText('Named')).toBeInTheDocument();
  });

  it('saves a change a moment later, the whole plan at once', async () => {
    jest.useFakeTimers();
    try {
      renderStore();
      await act(async () => {
        await Promise.resolve();
      });
      await screen.findByText('Saturday out');

      act(() => screen.getByRole('button', { name: 'rename' }).click());
      act(() => screen.getByRole('button', { name: 'set date' }).click());
      expect(savePlanOnServer).not.toHaveBeenCalled();

      act(() => jest.advanceTimersByTime(PLAN_SAVE_DELAY_MS));

      expect(savePlanOnServer).toHaveBeenCalledTimes(1);
      expect(savePlanOnServer).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'srv-1', title: 'Sunday out', date: '2026-07-05' }),
      );
    } finally {
      jest.useRealTimers();
    }
  });

  it('deletes a plan on the server', async () => {
    renderStore();
    await screen.findByText('Saturday out');

    await press('delete');

    expect(deletePlanOnServer).toHaveBeenCalledWith('srv-1');
    expect(screen.getByTestId('count')).toHaveTextContent('0');
  });

  it('moves the plans this browser kept to the account, once', async () => {
    const local = {
      id: 'plan_local',
      title: 'From before',
      date: null,
      stops: [],
      dateCreated: '',
    };
    window.localStorage.setItem(PLAN_STORAGE_KEY, JSON.stringify([local]));
    createPlanOnServer.mockResolvedValue({ ...local, id: 'srv-9' });
    fetchPlans.mockResolvedValue([serverPlan, { ...local, id: 'srv-9' }]);
    renderStore();

    await screen.findByText('2');
    // Its own id makes a repeat return the first copy, not a second one
    expect(createPlanOnServer).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'From before' }),
      'plan_local',
    );
    expect(window.localStorage.getItem(PLAN_STORAGE_KEY)).toBeNull();
  });

  it('keeps a browser plan that did not make it over, to try again', async () => {
    const local = {
      id: 'plan_local',
      title: 'From before',
      date: null,
      stops: [],
      dateCreated: '',
    };
    window.localStorage.setItem(PLAN_STORAGE_KEY, JSON.stringify([local]));
    createPlanOnServer.mockRejectedValue(new Error('offline'));
    renderStore();

    await screen.findByText('Saturday out');
    expect(JSON.parse(window.localStorage.getItem(PLAN_STORAGE_KEY) ?? '[]')).toHaveLength(1);
  });
});
