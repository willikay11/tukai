import { formatTimeLabel } from '@/components/ui/time-picker';
import {
  CreatePlaceAvailabilityException,
  PlaceAvailabilityException,
  PlaceAvailabilityRule,
} from '@/types/placeReservation';
import { apiDayOfWeek } from '@/utils/reservation-slots';

import { addDays, dayKey, dayLabel, parseDayKey } from './week-strip';

export type HoldOffMode = 'few-hours' | 'multiple-days';

export type HoldOffDraft = {
  mode: HoldOffMode;
  date: string | null;
  startTime: string | null;
  endTime: string | null;
  rangeStartDate: string | null;
  rangeEndDate: string | null;
};

export const EMPTY_HOLD_OFF: HoldOffDraft = {
  mode: 'few-hours',
  date: null,
  startTime: null,
  endTime: null,
  rangeStartDate: null,
  rangeEndDate: null,
};

export type HoldOffPlan = {
  exceptions: CreatePlaceAvailabilityException[];
  replacedExceptionIds: string[];
};

const hoursAndMinutes = (time: string): string => time.slice(0, 5);

const closedAllDay = (date: string): CreatePlaceAvailabilityException => ({
  date,
  isClosed: true,
});

const ruleOn = (rules: PlaceAvailabilityRule[], date: string) =>
  rules.find((rule) => rule.dayOfWeek === apiDayOfWeek(parseDayKey(date)));

// The API stores a date as one open window, so a hold with open hours on both sides has no form
export const toHoldOffException = (
  date: string,
  startTime: string | null,
  endTime: string | null,
  rules: PlaceAvailabilityRule[],
): CreatePlaceAvailabilityException | null => {
  if (!startTime || !endTime) return closedAllDay(date);

  const rule = ruleOn(rules, date);
  if (!rule) return closedAllDay(date);

  const holdOffStart = hoursAndMinutes(startTime);
  const holdOffEnd = hoursAndMinutes(endTime);
  const openTime = hoursAndMinutes(rule.openTime);
  const closeTime = hoursAndMinutes(rule.closeTime);

  const coversOpening = holdOffStart <= openTime;
  const coversClosing = holdOffEnd >= closeTime;

  if (coversOpening && coversClosing) return closedAllDay(date);
  if (coversOpening) return { date, isClosed: false, openTime: holdOffEnd, closeTime };
  if (coversClosing) return { date, isClosed: false, openTime, closeTime: holdOffStart };
  return null;
};

export const hasCompleteHoldOffDates = (draft: HoldOffDraft): boolean =>
  draft.mode === 'few-hours' ? !!draft.date : !!draft.rangeStartDate && !!draft.rangeEndDate;

export const holdOffError = (
  draft: HoldOffDraft,
  rules: PlaceAvailabilityRule[],
): string | null => {
  if (draft.mode === 'multiple-days') {
    const { rangeStartDate, rangeEndDate } = draft;
    if (rangeStartDate && rangeEndDate && rangeEndDate < rangeStartDate) {
      return 'End date must be on or after the start date.';
    }
    return null;
  }

  const { date, startTime, endTime } = draft;
  if (!!startTime !== !!endTime) return 'Set both a start and end time, or leave both empty.';
  if (startTime && endTime && endTime <= startTime) return 'End time must be after start time.';
  if (!date || !startTime || !endTime) return null;

  if (toHoldOffException(date, startTime, endTime, rules)) return null;

  const rule = ruleOn(rules, date);
  return `Reservations run ${formatTimeLabel(rule?.openTime ?? '')} - ${formatTimeLabel(rule?.closeTime ?? '')} on this date. Hold off from opening time or up to closing time, or leave the times empty for the whole day.`;
};

const plannedExceptions = (
  draft: HoldOffDraft,
  rules: PlaceAvailabilityRule[],
): CreatePlaceAvailabilityException[] => {
  if (draft.mode === 'few-hours') {
    if (!draft.date) return [];
    const exception = toHoldOffException(draft.date, draft.startTime, draft.endTime, rules);
    return exception ? [exception] : [];
  }

  const { rangeStartDate, rangeEndDate } = draft;
  if (!rangeStartDate || !rangeEndDate || rangeEndDate < rangeStartDate) return [];

  const days: CreatePlaceAvailabilityException[] = [];
  for (let day = parseDayKey(rangeStartDate); dayKey(day) <= rangeEndDate; day = addDays(day, 1)) {
    days.push(closedAllDay(dayKey(day)));
  }
  return days;
};

export const buildHoldOffPlan = (
  draft: HoldOffDraft,
  rules: PlaceAvailabilityRule[],
  exceptions: PlaceAvailabilityException[],
): HoldOffPlan => {
  const planned = plannedExceptions(draft, rules);
  const plannedDates = new Set(planned.map((exception) => exception.date));

  return {
    exceptions: planned,
    replacedExceptionIds: exceptions
      .filter((exception) => plannedDates.has(exception.date))
      .map((exception) => exception.id),
  };
};

export const upcomingHoldOffs = (
  exceptions: PlaceAvailabilityException[],
  now: Date = new Date(),
): PlaceAvailabilityException[] =>
  exceptions
    .filter((exception) => exception.date >= dayKey(now))
    .sort((left, right) => left.date.localeCompare(right.date));

export const describeHoldOff = (exception: PlaceAvailabilityException): string => {
  if (exception.isClosed) return 'Closed all day';
  if (!exception.openTime || !exception.closeTime) return 'Open as usual';
  return `Open ${formatTimeLabel(exception.openTime)} - ${formatTimeLabel(exception.closeTime)}`;
};

export const closedDayKeys = (
  exceptions: PlaceAvailabilityException[],
  now: Date = new Date(),
): string[] =>
  upcomingHoldOffs(exceptions, now)
    .filter((exception) => exception.isClosed)
    .map((exception) => exception.date);

const dayRanges = (keys: string[]): string[] => {
  const ranges: { first: string; last: string }[] = [];

  for (const key of keys) {
    const current = ranges[ranges.length - 1];
    if (current && dayKey(addDays(parseDayKey(current.last), 1)) === key) current.last = key;
    else ranges.push({ first: key, last: key });
  }

  return ranges.map(({ first, last }) =>
    first === last ? dayLabel(first) : `${dayLabel(first)} to ${dayLabel(last)}`,
  );
};

export const holdOffLine = (
  status: string | undefined,
  exceptions: PlaceAvailabilityException[],
  now: Date = new Date(),
): string | null => {
  if (status === 'paused') return 'New bookings are paused.';

  const closed = closedDayKeys(exceptions, now);
  return closed.length > 0 ? `Dates blocked: ${dayRanges(closed).join(', ')}.` : null;
};
