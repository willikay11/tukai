import { Plan, PlanStop } from '@/types/plan';

import {
  DEFAULT_SLOT,
  SLOTS,
  alreadyInPlan,
  nextFreeTime,
  planOptionNote,
  planThisWarning,
} from './plan-this';

const stop = (overrides: Partial<PlanStop> = {}): PlanStop => ({
  id: 's1',
  kind: 'place',
  title: 'Karura',
  time: '09:00',
  durationMinutes: 90,
  ...overrides,
});

const plan = (overrides: Partial<Plan> = {}): Plan => ({
  id: 'p1',
  title: 'Saturday out',
  date: '2026-07-05',
  stops: [],
  dateCreated: '2026-07-01T00:00:00Z',
  ...overrides,
});

describe('the slots', () => {
  it('offers the four the canvas has, and opens on midday', () => {
    expect(SLOTS.map((one) => one.label)).toEqual(['Morning', 'Midday', 'Afternoon', 'Evening']);
    expect(DEFAULT_SLOT.time).toBe('12:00');
  });
});

/**
 * A new stop lands after the last one, so a day builds up in order without the
 * reader retyping times.
 */
describe('nextFreeTime', () => {
  it('starts an empty plan at ten', () => {
    expect(nextFreeTime(plan())).toBe('10:00');
  });

  it('follows the last stop, rounded up to the half hour', () => {
    expect(nextFreeTime(plan({ stops: [stop({ time: '09:10', durationMinutes: 90 })] }))).toBe(
      '11:00',
    );
  });

  it('takes the latest end, not the last in the list', () => {
    expect(
      nextFreeTime(
        plan({
          stops: [stop({ id: 'a', time: '15:00' }), stop({ id: 'b', time: '09:00' })],
        }),
      ),
    ).toBe('16:30');
  });

  // A plan does not run into the small hours
  it('never goes past ten at night', () => {
    expect(nextFreeTime(plan({ stops: [stop({ time: '21:30', durationMinutes: 180 })] }))).toBe(
      '22:00',
    );
  });

  it('ignores a stop with no time', () => {
    expect(nextFreeTime(plan({ stops: [stop({ time: undefined })] }))).toBe('10:00');
  });
});

describe('planOptionNote', () => {
  it('gives the day and the count', () => {
    expect(planOptionNote(plan({ stops: [stop()] }))).toBe('2026-07-05, 1 stop');
  });

  it('calls a plan with no day a draft', () => {
    expect(planOptionNote(plan({ date: null, stops: [stop(), stop({ id: 's2' })] }))).toBe(
      'Draft, no day yet — 2 stops',
    );
  });
});

describe('alreadyInPlan', () => {
  it('knows what is already on a plan', () => {
    expect(alreadyInPlan(plan({ stops: [stop({ refId: 'p9' })] }), 'p9')).toBe(true);
    expect(alreadyInPlan(plan({ stops: [stop({ refId: 'p9' })] }), 'other')).toBe(false);
  });

  it('copes with no plan at all', () => {
    expect(alreadyInPlan(undefined, 'p9')).toBe(false);
  });
});

/**
 * One warning, the most useful. A clash of days belongs here rather than only
 * in the plan: it is the reason someone would pick a different plan.
 */
describe('planThisWarning', () => {
  it('says nothing when there is nothing to say', () => {
    expect(planThisWarning({ plan: plan(), refId: 'e1' })).toBeNull();
  });

  it('leads with what is already on the plan', () => {
    const on = plan({ stops: [stop({ refId: 'e1' })] });

    expect(planThisWarning({ plan: on, refId: 'e1', soldOut: true })).toBe(
      'Already in Saturday out.',
    );
  });

  it('warns that something is sold out without blocking the plan', () => {
    expect(planThisWarning({ plan: plan(), refId: 'e1', soldOut: true })).toContain(
      'Sold out right now',
    );
  });

  it('warns when the day does not match', () => {
    expect(planThisWarning({ plan: plan(), refId: 'e1', refDate: '2026-07-12T08:00:00Z' })).toBe(
      'Saturday out is on 2026-07-05. This runs on 2026-07-12, so it will be flagged in the plan.',
    );
  });

  it('says nothing about the day when the plan has none', () => {
    expect(
      planThisWarning({ plan: plan({ date: null }), refId: 'e1', refDate: '2026-07-12' }),
    ).toBeNull();
  });

  it('says nothing about a new plan', () => {
    expect(planThisWarning({ refId: 'e1', refDate: '2026-07-12' })).toBeNull();
  });
});
