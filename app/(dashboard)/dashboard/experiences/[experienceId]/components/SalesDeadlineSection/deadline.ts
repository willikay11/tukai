import moment from 'moment';

import { Experience } from '@/types/experience';

export type DeadlineUnit = 'minutes' | 'hours' | 'days';
export type DeadlineCondition = 'before_start' | 'before_end';

export type DeadlinePreset = {
  key: string;
  duration: number;
  unit: DeadlineUnit;
  condition: DeadlineCondition;
};

/**
 * The three the canvas offers. The API takes any duration and unit, so a code
 * set elsewhere - on mobile, or in the create flow - can be something else; the
 * view line reads it either way, and these are what a host can pick here.
 */
export const DEADLINE_PRESETS: DeadlinePreset[] = [
  { key: '1h-start', duration: 1, unit: 'hours', condition: 'before_start' },
  { key: '1h-end', duration: 1, unit: 'hours', condition: 'before_end' },
  { key: '1d-start', duration: 1, unit: 'days', condition: 'before_start' },
];

/** "1 hour before the experience starts", "2 days before the experience ends". */
export const deadlineLabel = (
  duration: number | null | undefined,
  unit: DeadlineUnit | null | undefined,
  condition: DeadlineCondition | null | undefined,
): string => {
  if (!duration || !unit) return 'Not set';

  // The API's units are plural; one of anything is not
  const noun = duration === 1 ? unit.replace(/s$/, '') : unit;
  const anchor = condition === 'before_end' ? 'ends' : 'starts';

  return `${duration} ${noun} before the experience ${anchor}`;
};

export const presetFor = (
  duration: number | null | undefined,
  unit: DeadlineUnit | null | undefined,
  condition: DeadlineCondition | null | undefined,
): DeadlinePreset | undefined =>
  DEADLINE_PRESETS.find(
    (preset) =>
      preset.duration === duration &&
      preset.unit === unit &&
      // The API leaves the condition unset on older experiences, and the
      // default there is before the start
      preset.condition === (condition ?? 'before_start'),
  );

/**
 * When sales actually close, counted back from whichever end of the experience
 * the condition names.
 */
export const deadlineAt = (
  experience: Pick<
    Experience,
    'startDate' | 'endDate' | 'ticketSalesClosingDuration' | 'ticketSalesClosingUnit'
  > & { ticketSalesClosingCondition?: DeadlineCondition | null },
  override?: DeadlinePreset,
): Date | null => {
  const duration = override?.duration ?? experience.ticketSalesClosingDuration;
  const unit = override?.unit ?? experience.ticketSalesClosingUnit;
  const condition = override?.condition ?? experience.ticketSalesClosingCondition ?? 'before_start';

  const anchor = condition === 'before_end' ? experience.endDate : experience.startDate;
  if (!anchor || !duration || !unit) return null;

  const at = moment(anchor);
  if (!at.isValid()) return null;

  return at.subtract(duration, unit).toDate();
};

/** "Sales close Sat 4 Jul, 5:00 PM." - and for a recurring one, the next date. */
export const deadlineWhen = (at: Date | null, isRecurring = false): string => {
  if (!at) return 'No deadline is set, so sales run until the experience starts.';

  return `Sales close ${moment(at).format('ddd D MMM, h:mm A')}${
    isRecurring ? ' for the next date.' : '.'
  }`;
};
