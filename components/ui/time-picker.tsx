'use client';

import * as React from 'react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

export interface TimePickerProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  /**
   * Earliest time ("HH:MM") that can be chosen. Anything at or before it is
   * dropped from the list — used to stop an end time landing before its start.
   */
  minTime?: string;
}

// Half-hour steps: 48 options across the day
const STEP_MINUTES = 30;
const MINUTES_PER_DAY = 24 * 60;

const toMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return NaN;
  return hours * 60 + minutes;
};

/** Minutes since midnight → "HH:MM" in 24-hour form, which is what callers store. */
const toValue = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  return `${String(hours).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
};

/** "13:30" → "01:30 PM" */
export const formatTimeLabel = (time: string): string => {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours, 10);
  if (!Number.isFinite(hour)) return time;

  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;

  return `${String(displayHour).padStart(2, '0')}:${minutes} ${period}`;
};

const ALL_SLOTS: string[] = Array.from({ length: MINUTES_PER_DAY / STEP_MINUTES }, (_, index) =>
  toValue(index * STEP_MINUTES),
);

/**
 * A plain half-hour time list.
 *
 * This replaced a scrolling hour/minute/period drum with a Save step. Every
 * caller stores "HH:MM" in 24-hour form, so the value contract is unchanged —
 * only how a time is chosen.
 *
 * A value that is not on the half hour (an experience saved before this, or one
 * edited through the API) is kept and offered alongside the slots, so opening
 * the picker never silently rounds what is already stored.
 */
const TimePicker = React.forwardRef<HTMLButtonElement, TimePickerProps>(
  ({ value, onChange, placeholder = 'Select time', className, disabled, minTime }, ref) => {
    const options = React.useMemo(() => {
      const floor = minTime ? toMinutes(minTime) : NaN;

      const slots = Number.isFinite(floor)
        ? ALL_SLOTS.filter((slot) => toMinutes(slot) > floor)
        : [...ALL_SLOTS];

      // Keep a stored off-step value selectable rather than dropping it
      if (value && !slots.includes(value)) {
        slots.push(value);
        slots.sort((a, b) => toMinutes(a) - toMinutes(b));
      }

      return slots;
    }, [minTime, value]);

    return (
      <Select value={value || undefined} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger
          ref={ref}
          // 44px and a 14px radius, matching the Input and DatePicker fields
          // it sits beside
          className={cn('h-11 rounded-[14px] text-xs', className)}
          aria-label={placeholder}
        >
          {/* No children here: given children, Radix renders those INSTEAD of
              mirroring the chosen item's text, and the trigger came up empty
              after a selection. Left bare, it mirrors the SelectItem label. */}
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>

        <SelectContent className="max-h-[280px]">
          {options.length === 0 ? (
            <p className="px-3 py-4 text-center text-xs text-muted-foreground">
              No times left after {minTime ? formatTimeLabel(minTime) : 'the start time'}
            </p>
          ) : (
            options.map((slot) => (
              <SelectItem key={slot} value={slot} className="text-xs">
                {formatTimeLabel(slot)}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    );
  },
);

TimePicker.displayName = 'TimePicker';

export { TimePicker };
