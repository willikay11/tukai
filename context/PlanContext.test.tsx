import React from 'react';

import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { PLAN_STORAGE_KEY } from '@/types/plan';

import { PlanProvider, usePlans } from './PlanContext';

/**
 * ⚠️ Plans have no endpoint: this store is where they live, and the one seam
 * persistence lands in when one arrives.
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
      <p data-testid="title">{plan?.title ?? '—'}</p>
      <p data-testid="date">{plan?.date ?? '—'}</p>
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
  beforeEach(() => window.localStorage.clear());

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
