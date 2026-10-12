import { Experience } from '@/types/experience';
import { QuickDate, TimeOfDay } from '@/types/search';

export const QUICK_DATES: Array<{ value: QuickDate; label: string }> = [
  { value: 'today', label: 'Today' },
  { value: 'tomorrow', label: 'Tomorrow' },
  { value: 'weekend', label: 'This weekend' },
  { value: 'next7', label: 'Next 7 days' },
];

export const TIME_OF_DAY: Array<{
  value: TimeOfDay;
  label: string;
  description: string;
  icon: string;
}> = [
  { value: 'morning', label: 'Morning', description: 'Before 12 PM', icon: 'SunriseIcon' },
  { value: 'afternoon', label: 'Afternoon', description: '12 - 5 PM', icon: 'Sun03Icon' },
  { value: 'evening', label: 'Evening', description: '5 - 9 PM', icon: 'SunsetIcon' },
];

const startOfDay = (date: Date): Date => new Date(date.getFullYear(), date.getMonth(), date.getDate());

const addDays = (date: Date, days: number): Date => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

/**
 * The window a quick pick stands for, each one ending at the close of its
 * last day. "This weekend" is the coming Saturday and Sunday - today's own
 * weekend, if today already is one.
 */
const quickDateRange = (quickDate: QuickDate, now: Date): { start: Date; end: Date } => {
  const today = startOfDay(now);

  if (quickDate === 'today') return { start: today, end: addDays(today, 1) };
  if (quickDate === 'tomorrow') return { start: addDays(today, 1), end: addDays(today, 2) };
  if (quickDate === 'next7') return { start: today, end: addDays(today, 7) };

  // weekend
  const day = today.getDay();
  const daysToSaturday = (6 - day + 7) % 7;
  const saturday = addDays(today, daysToSaturday);
  return { start: saturday, end: addDays(saturday, 2) };
};

/** No quick pick means every day - an exact `date` narrows separately. */
export const matchesQuickDate = (
  experience: Experience,
  quickDate: QuickDate | undefined,
  now: Date = new Date(),
): boolean => {
  if (!quickDate) return true;
  if (!experience.startDate) return false;

  const { start, end } = quickDateRange(quickDate, now);
  const startDate = new Date(experience.startDate);
  return startDate >= start && startDate < end;
};

const bandOf = (hour: number): TimeOfDay => {
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
};

/** No bands picked means every start time. */
export const matchesTimeOfDay = (experience: Experience, bands: TimeOfDay[]): boolean => {
  if (bands.length === 0) return true;
  if (!experience.startDate) return false;

  return bands.includes(bandOf(new Date(experience.startDate).getHours()));
};
