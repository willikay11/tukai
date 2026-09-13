import { RRule } from 'rrule';

const dayNameToRRuleMapping: Record<
  'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun',
  typeof RRule.MO
> = {
  mon: RRule.MO,
  tue: RRule.TU,
  wed: RRule.WE,
  thu: RRule.TH,
  fri: RRule.FR,
  sat: RRule.SA,
  sun: RRule.SU,
};

interface DateTypeData {
  isRecurring: boolean;
  recurringDays?: ('mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun')[];
  recurrenceStartDate?: string | null;
  recurrenceEndDate?: string | null;
  timeSlots?: { startTime: string | null; endTime: string | null }[];
}

export const buildRecurrenceRule = (dateTypeData: DateTypeData): string => {
  // If not recurring, return empty string
  if (!dateTypeData.isRecurring) {
    return '';
  }

  const {
    recurringDays = [],
    recurrenceStartDate,
    recurrenceEndDate,
    timeSlots = [],
  } = dateTypeData;

  // Validate required data for recurring experiences
  if (!recurrenceStartDate || !recurrenceEndDate || recurringDays.length === 0) {
    return '';
  }

  // Get start time from first time slot
  const firstTimeSlot = timeSlots[0];
  const startTime = firstTimeSlot?.startTime || '00:00';

  // Convert UI day names to RRule weekday constants
  const byweekday = recurringDays
    .map((day) => dayNameToRRuleMapping[day])
    .filter((day) => day !== undefined);

  if (byweekday.length === 0) {
    return '';
  }

  // Parse dates and combine with time
  const [year, month, day] = recurrenceStartDate.split('-').map(Number);
  const [hour, minute] = startTime.split(':').map(Number);

  const [endYear, endMonth, endDay] = recurrenceEndDate.split('-').map(Number);

  // Create start date with time
  const dtstart = new Date(year, month - 1, day, hour, minute, 0);

  // Create end date (until is inclusive and should be end of day)
  const until = new Date(endYear, endMonth - 1, endDay, 23, 59, 59);

  // Build the RRule
  const rule = new RRule({
    freq: RRule.WEEKLY,
    byweekday,
    dtstart,
    until,
  });

  return rule.toString();
};
