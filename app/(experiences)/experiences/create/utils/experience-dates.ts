import moment from 'moment';

import { localDateTimeToUtcIso } from '@/utils/utc-time';

/** The date and time fields of the create flow's first step, all local. */
export interface ExperienceDateFields {
  experienceType: 'one-time' | 'multi-day' | 'itinerary';
  isRecurring: boolean;
  date: string | null;
  startTime: string | null;
  endTime: string | null;
  recurrenceStartDate: string | null;
  timeSlots: { startTime: string | null; endTime: string | null }[];
  multiDayStartDate: string | null;
  multiDayStartTime: string | null;
  multiDayEndDate: string | null;
  multiDayEndTime: string | null;
  itineraryStartDate: string | null;
  itineraryEndDate: string | null;
}

export type ExperienceDates =
  | {
      /** UTC instants, for the API's start_date and end_date */
      startDate: string;
      endDate: string;
      /** The local first and last dates (YYYY-MM-DD) they came from */
      localStartDate: string;
      localEndDate: string;
    }
  | { error: string };

/**
 * The experience's start_date and end_date, from the form's local fields (in
 * `timeZone`, the experience's; the browser's when not given), as the UTC
 * instants the API stores. Which fields count depends on the kind of
 * experience:
 *
 * - Itinerary: its first and last day, whole days.
 * - Multi-day: its own start and end date and time.
 * - Recurring: the FIRST occurrence only - the first day, from the first
 *   slot's start to its end (the next day when it runs past midnight).
 *   end_date - start_date is the length of one occurrence; the rule's UNTIL
 *   ends the series. A series-long end_date would overlap the next
 *   occurrence, and the API rejects that.
 * - Single day: the date, from start to end time.
 */
export const buildExperienceDates = (
  fields: ExperienceDateFields,
  timeZone?: string | null,
): ExperienceDates => {
  const isItinerary = fields.experienceType === 'itinerary';

  let startDate = '';
  let endDate = '';
  let startTime: string | null = null;
  let endTime: string | null = null;

  if (isItinerary) {
    startDate = fields.itineraryStartDate || '';
    endDate = fields.itineraryEndDate || '';
  } else if (fields.experienceType === 'multi-day') {
    startDate = fields.multiDayStartDate || '';
    endDate = fields.multiDayEndDate || '';
    startTime = fields.multiDayStartTime || null;
    endTime = fields.multiDayEndTime || null;
  } else if (fields.isRecurring) {
    startDate = fields.recurrenceStartDate || '';
    startTime = fields.timeSlots?.[0]?.startTime || null;
    endTime = fields.timeSlots?.[0]?.endTime || null;
    const runsPastMidnight = Boolean(startTime && endTime && endTime <= startTime);
    endDate =
      startDate && runsPastMidnight
        ? moment(startDate).add(1, 'day').format('YYYY-MM-DD')
        : startDate;
  } else {
    startDate = fields.date || '';
    endDate = fields.date || '';
    startTime = fields.startTime || null;
    endTime = fields.endTime || null;
  }

  if (!startDate || !endDate) {
    return { error: 'Please set start and end dates before continuing.' };
  }
  if (!isItinerary && (!startTime || !endTime)) {
    return {
      error: 'Please set a start date, end date, start time and end time before continuing.',
    };
  }

  return {
    startDate: localDateTimeToUtcIso(startDate, startTime, false, timeZone),
    endDate: localDateTimeToUtcIso(endDate, endTime, true, timeZone),
    localStartDate: startDate,
    localEndDate: endDate,
  };
};
