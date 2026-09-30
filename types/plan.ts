/**
 * A plan: a day out, and the stops on it.
 *
 * ⚠️ No endpoint backs this. Nothing in the API stores an itinerary of a
 * reader's own, so a plan lives in the browser and every read and write goes
 * through the plan store — the one seam where persistence lands the day an
 * endpoint exists.
 *
 * A stop keeps a snapshot of what it points at (title, subtitle, photo, and for
 * an experience its date and time). Without one, drawing a plan would mean a
 * request per stop, and a plan whose experience is later delisted would render
 * as an empty row rather than saying what is wrong.
 */
export type PlanStopKind = 'experience' | 'place' | 'custom';

export type PlanStop = {
  id: string;
  kind: PlanStopKind;
  /** The experience or place this points at. A custom stop points at nothing. */
  refId?: string;
  /** What it was called when it was added. */
  title: string;
  subtitle?: string;
  photo?: string | null;
  /** 'HH:MM', as typed. A stop with no time is not yet placed in the day. */
  time?: string;
  /** Minutes. Used to work out when a stop ends. */
  durationMinutes?: number;
  /** For an experience: the date it runs, so a clash with the plan's day shows. */
  refDate?: string | null;
  /** For an experience: whether the reader holds a ticket. */
  isBooked?: boolean;
  soldOut?: boolean;
};

export type Plan = {
  id: string;
  title: string;
  /** The day out. A plan without one is a draft. */
  date?: string | null;
  stops: PlanStop[];
  dateCreated: string;
};

export const PLAN_STORAGE_KEY = 'tukai.plans.v1';

/** Minutes past midnight, or null where there is no time to read. */
export const minutesOf = (time?: string | null): number | null => {
  const match = /^(\d{1,2}):(\d{2})$/.exec(String(time ?? '').trim());
  if (!match) return null;

  const minutes = Number(match[1]) * 60 + Number(match[2]);

  return minutes >= 0 && minutes < 1440 ? minutes : null;
};

export const timeLabel = (minutes: number | null): string => {
  if (minutes === null) return '';

  const hour = Math.floor(minutes / 60);
  const suffix = hour < 12 ? 'AM' : 'PM';
  const twelve = hour % 12 === 0 ? 12 : hour % 12;

  return `${twelve}:${String(minutes % 60).padStart(2, '0')} ${suffix}`;
};

export const stopEnd = (stop: PlanStop): number | null => {
  const start = minutesOf(stop.time);

  return start === null ? null : start + (stop.durationMinutes ?? 60);
};

/** The default length of a stop, by what it is — the canvas's own numbers. */
export const DEFAULT_DURATION: Record<PlanStopKind, number> = {
  experience: 120,
  place: 90,
  custom: 30,
};

/**
 * What is worth flagging about a stop, in the order it matters.
 *
 * Only one is shown: the first thing wrong is the thing to fix, and a row
 * carrying three warnings reads as broken rather than as fixable.
 */
export const stopWarning = (
  stop: PlanStop,
  previous: PlanStop | undefined,
  planDate?: string | null,
): string | null => {
  if (stop.soldOut && !stop.isBooked) {
    return 'Sold out. Look for another date, or take it off the plan.';
  }

  if (stop.kind === 'experience' && stop.refDate && planDate) {
    const runs = stop.refDate.slice(0, 10);
    if (runs !== planDate.slice(0, 10)) {
      return `This runs on ${runs}, not on the day of this plan.`;
    }
  }

  const start = minutesOf(stop.time);
  const previousStart = previous ? minutesOf(previous.time) : null;

  if (start !== null && previousStart !== null && start < previousStart) {
    return 'Starts earlier than the stop above. Sort by time to fix the order.';
  }

  const previousEnd = previous ? stopEnd(previous) : null;

  if (start !== null && previousEnd !== null && start < previousEnd) {
    return `Starts before ${previous?.title} ends at ${timeLabel(previousEnd)}.`;
  }

  return null;
};

export const planWarnings = (plan: Plan): number =>
  plan.stops.filter((stop, index) => stopWarning(stop, plan.stops[index - 1], plan.date)).length;

/** "3 stops, from 9:00 AM", or that there are none yet. */
export const planMeta = (plan: Plan): string => {
  const count = plan.stops.length;
  if (count === 0) return 'No stops yet';

  const starts = plan.stops.map((stop) => minutesOf(stop.time)).filter((at) => at !== null);
  const earliest = starts.length ? Math.min(...(starts as number[])) : null;

  return `${count} ${count === 1 ? 'stop' : 'stops'}${
    earliest === null ? '' : `, from ${timeLabel(earliest)}`
  }`;
};

/** The cover a plan card shows: the first stop that brought a photo. */
export const planPhoto = (plan: Plan): string | undefined =>
  plan.stops.find((stop) => stop.photo)?.photo ?? undefined;

/** Stops in time order, with the untimed ones left at the end. */
export const sortedByTime = (stops: PlanStop[]): PlanStop[] =>
  [...stops].sort((a, b) => {
    const left = minutesOf(a.time);
    const right = minutesOf(b.time);

    if (left === null && right === null) return 0;
    if (left === null) return 1;
    if (right === null) return -1;

    return left - right;
  });

export const moveStop = (stops: PlanStop[], from: number, to: number): PlanStop[] => {
  if (from === to || from < 0 || to < 0 || from >= stops.length || to >= stops.length) {
    return stops;
  }

  const next = [...stops];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);

  return next;
};
