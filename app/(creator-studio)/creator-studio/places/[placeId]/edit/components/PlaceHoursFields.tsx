'use client';

import { TimePicker, formatTimeLabel } from '@/components/ui/time-picker';
import { cn } from '@/lib/utils';

const DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const;

export type HoursValue = { days: string[]; opensAt: string; closesAt: string };

/** Monday…Friday collapses to "Monday - Friday"; gaps stay listed. */
const describeDays = (days: string[]): string => {
  const ordered = DAYS.filter((day) => days.includes(day));
  if (ordered.length === 0) return '';

  const runs: string[][] = [];
  ordered.forEach((day) => {
    const previous = runs[runs.length - 1];
    const isNext =
      previous && DAYS.indexOf(day) === DAYS.indexOf(previous[previous.length - 1] as never) + 1;

    if (isNext) previous.push(day);
    else runs.push([day]);
  });

  return runs
    .map((run) => (run.length > 1 ? `${run[0]} - ${run[run.length - 1]}` : run[0]))
    .join(', ');
};

/**
 * Composes the stored "Open Hours" value, e.g.
 * "Monday - Sunday: 11:00 AM - 11:00 PM" — the shape places already hold.
 */
export const formatOpenHours = ({ days, opensAt, closesAt }: HoursValue): string => {
  const dayLabel = describeDays(days);
  if (!dayLabel || !opensAt || !closesAt) return '';

  return `${dayLabel}: ${formatTimeLabel(opensAt)} - ${formatTimeLabel(closesAt)}`;
};

/** "01:30 PM" → "13:30", so a stored value can seed the pickers. */
const toTimeValue = (label: string): string => {
  // Anchored at both ends: a value with anything trailing the time is not a
  // time, and reading it as one is how a second range gets silently dropped
  const match = label.trim().match(/^(\d{1,2}):(\d{2})\s*([AaPp])[Mm]?$/);
  if (!match) return '';

  const [, rawHour, minutes, period] = match;
  let hour = parseInt(rawHour, 10);

  if (period?.toLowerCase() === 'p' && hour < 12) hour += 12;
  if (period?.toLowerCase() === 'a' && hour === 12) hour = 0;

  return `${String(hour).padStart(2, '0')}:${minutes}`;
};

/**
 * Reads a stored value back into the form.
 *
 * Only the shape this field writes is understood. Anything else — the free-form
 * hours some places carry, several ranges split by "|" — is left alone by
 * returning nothing, so the caller keeps the stored text rather than
 * overwriting it with a half-parse.
 */
export const parseOpenHours = (value: string): HoursValue | null => {
  // Several ranges in one value ("Mon - Sat: … | Sunday: …") say more than this
  // field can hold, and keeping only the first would delete the rest on save
  if (value.includes('|')) return null;

  const match = value.match(/^([^:]+):\s*(.+?)\s+-\s+(.+)$/);
  if (!match) return null;

  const [, dayPart, opens, closes] = match;
  const days: string[] = [];

  dayPart.split(',').forEach((segment) => {
    const [from, to] = segment.split('-').map((entry) => entry.trim());
    const fromIndex = DAYS.indexOf(from as never);

    if (fromIndex === -1) return;
    if (!to) {
      days.push(DAYS[fromIndex]);
      return;
    }

    const toIndex = DAYS.indexOf(to as never);
    if (toIndex === -1) return;
    for (let index = fromIndex; index <= toIndex; index += 1) days.push(DAYS[index]);
  });

  const opensAt = toTimeValue(opens);
  const closesAt = toTimeValue(closes);

  if (days.length === 0 || !opensAt || !closesAt) return null;

  return { days, opensAt, closesAt };
};

export const PlaceHoursFields = ({
  value,
  onChange,
}: {
  value: HoursValue;
  onChange: (value: HoursValue) => void;
}) => {
  const preview = formatOpenHours(value);

  const toggleDay = (day: string) =>
    onChange({
      ...value,
      days: value.days.includes(day)
        ? value.days.filter((entry) => entry !== day)
        : [...value.days, day],
    });

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-xs font-medium text-gray-800">Active days of the week</p>
        <div className="flex flex-wrap gap-2">
          {DAYS.map((day) => {
            const isSelected = value.days.includes(day);

            return (
              <button
                key={day}
                type="button"
                aria-pressed={isSelected}
                onClick={() => toggleDay(day)}
                className={cn(
                  'rounded-full px-4 py-2 text-xs font-medium transition-colors',
                  isSelected
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200',
                )}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium text-gray-800">
          Opening and Closing Hours/Operating Hours
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <TimePicker
            value={value.opensAt}
            placeholder="Opening time"
            onChange={(opensAt) => onChange({ ...value, opensAt })}
          />
          <TimePicker
            value={value.closesAt}
            placeholder="Closing time"
            // An end before its start is not a day's hours
            minTime={value.opensAt}
            onChange={(closesAt) => onChange({ ...value, closesAt })}
          />
        </div>

        {preview && (
          <p className="rounded-2xl bg-gray-50 p-4 text-xs text-gray-600">
            <span className="font-semibold text-gray-900">Operating Hours: </span>
            {preview}
          </p>
        )}
      </div>
    </div>
  );
};
