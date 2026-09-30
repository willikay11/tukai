import { Plan, PlanStop, minutesOf, stopEnd, timeLabel } from '@/types/plan';

/** The canvas's four slots, for a stop whose time is the reader's to choose. */
export const SLOTS: Array<{ id: string; label: string; time: string }> = [
  { id: 'morning', label: 'Morning', time: '09:00' },
  { id: 'midday', label: 'Midday', time: '12:00' },
  { id: 'afternoon', label: 'Afternoon', time: '15:00' },
  { id: 'evening', label: 'Evening', time: '18:00' },
];

export const DEFAULT_SLOT = SLOTS[1];

/**
 * The time to put a new stop at: after the last one that has an end, rounded up
 * to the half hour and never past ten at night. A plan with nothing timed yet
 * starts at ten.
 */
export const nextFreeTime = (plan: Plan): string => {
  const ends = plan.stops.map(stopEnd).filter((end): end is number => end !== null);

  if (ends.length === 0) return '10:00';

  const after = Math.min(22 * 60, Math.ceil(Math.max(...ends) / 30) * 30);

  return `${String(Math.floor(after / 60)).padStart(2, '0')}:${String(after % 60).padStart(2, '0')}`;
};

/** How a plan reads in the list of plans to add to. */
export const planOptionNote = (plan: Plan): string => {
  const count = plan.stops.length;
  const stops = `${count} ${count === 1 ? 'stop' : 'stops'}`;

  return plan.date ? `${plan.date}, ${stops}` : `Draft, no day yet — ${stops}`;
};

export const alreadyInPlan = (plan: Plan | undefined, refId: string): boolean =>
  Boolean(plan?.stops.some((stop) => stop.refId === refId));

/**
 * What to say before anything is added — one thing, the most useful.
 *
 * A clash of days is worth saying here rather than only in the plan: it is the
 * reason someone would choose a different plan.
 */
export const planThisWarning = ({
  plan,
  refId,
  refDate,
  soldOut,
}: {
  plan?: Plan;
  refId: string;
  refDate?: string | null;
  soldOut?: boolean;
}): string | null => {
  if (alreadyInPlan(plan, refId)) return `Already in ${plan?.title}.`;

  if (soldOut) {
    return 'Sold out right now. You can still plan around it and look for another date.';
  }

  if (plan?.date && refDate && refDate.slice(0, 10) !== plan.date.slice(0, 10)) {
    return `${plan.title} is on ${plan.date}. This runs on ${refDate.slice(
      0,
      10,
    )}, so it will be flagged in the plan.`;
  }

  return null;
};

/** The time a stop ends up at, read back for the message afterwards. */
export const stopTimeLabel = (stop: Pick<PlanStop, 'time'>): string =>
  timeLabel(minutesOf(stop.time));
