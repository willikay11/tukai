'use client';

import { useEffect, useMemo } from 'react';

import moment from 'moment';
import { RRule } from 'rrule';

import { formatFullDayLabel } from '@/utils/recurrence-utils';

interface RecurringTimeSlot {
  id: string;
  label: string;
}

interface RecurringDateSlotPickerProps {
  recurrenceRule: string;
  timeSlots: RecurringTimeSlot[];
  selectedDate: string | null; // YYYY-MM-DD
  onDateChange: (date: string) => void;
  selectedSlotId: string | null;
  onSlotChange: (slotId: string) => void;
}

// RRule weekday numbers: 0 = Monday … 6 = Sunday
const RRULE_DAY_NAMES = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

const MAX_STRIP_DAYS = 30;

export const RecurringDateSlotPicker = ({
  recurrenceRule,
  timeSlots,
  selectedDate,
  onDateChange,
  selectedSlotId,
  onSlotChange,
}: RecurringDateSlotPickerProps) => {
  const parsed = useMemo(() => {
    try {
      const rule = new RRule(RRule.parseString(recurrenceRule));
      const byweekday: number[] = (rule.options.byweekday ?? []) as number[];

      // Show days from today (or the rule start, if later) through the rule end
      const start = moment.max(moment(), moment(rule.options.dtstart)).startOf('day');
      const end = rule.options.until
        ? moment(rule.options.until).startOf('day')
        : start.clone().add(MAX_STRIP_DAYS - 1, 'days');

      const days: { date: string; enabled: boolean }[] = [];
      const cursor = start.clone();
      while (cursor.isSameOrBefore(end) && days.length < MAX_STRIP_DAYS) {
        // Convert RRule weekday (0 = Mon) to JS weekday (0 = Sun)
        const enabled = byweekday.some((day) => (day + 1) % 7 === cursor.day());
        days.push({ date: cursor.format('YYYY-MM-DD'), enabled });
        cursor.add(1, 'day');
      }

      const daysLabel = formatFullDayLabel(byweekday.map((day) => RRULE_DAY_NAMES[day]));

      return { days, daysLabel };
    } catch {
      return null;
    }
  }, [recurrenceRule]);

  const firstEnabledDate = parsed?.days.find((day) => day.enabled)?.date ?? null;

  // Default to the first available occurrence
  useEffect(() => {
    if (!selectedDate && firstEnabledDate) {
      onDateChange(firstEnabledDate);
    }
  }, [selectedDate, firstEnabledDate, onDateChange]);

  if (!parsed) {
    return null;
  }

  const monthLabel = moment(selectedDate ?? firstEnabledDate ?? undefined).format('MMMM YYYY');

  return (
    <div className="space-y-3">
      <p className="text-sm font-bold text-gray-900">Select Date &amp; Slot</p>

      <div className="space-y-4 rounded-2xl bg-white p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-bold text-gray-900">{monthLabel}</p>
          {parsed.daysLabel && (
            <span className="rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-medium text-primary">
              Recurs Every {parsed.daysLabel}
            </span>
          )}
        </div>

        {parsed.days.length === 0 ? (
          <p className="text-xs text-gray-500">No upcoming dates for this experience.</p>
        ) : (
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {parsed.days.map((day) => {
              const isSelected = day.date === selectedDate;
              return (
                <button
                  key={day.date}
                  type="button"
                  disabled={!day.enabled}
                  onClick={() => onDateChange(day.date)}
                  aria-label={moment(day.date).format('ddd, MMM D')}
                  className={`flex flex-shrink-0 flex-col items-center gap-1 rounded-2xl px-4 py-3 text-center transition-colors ${
                    isSelected
                      ? 'bg-emerald-100 text-primary'
                      : day.enabled
                        ? 'border border-gray-200 bg-white text-gray-900 hover:border-gray-300'
                        : 'cursor-not-allowed bg-gray-100 text-gray-400'
                  } `}
                >
                  <span className="text-xs">{moment(day.date).format('ddd')}</span>
                  <span className="text-base font-semibold">{moment(day.date).format('D')}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {timeSlots.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {timeSlots.map((slot) => {
            const isSelected = slot.id === selectedSlotId;
            return (
              <button
                key={slot.id}
                type="button"
                onClick={() => onSlotChange(slot.id)}
                className={`rounded-full px-5 py-3 text-xs font-normal transition-colors ${
                  isSelected
                    ? 'bg-gradient-to-b from-[#047857] to-[#064E3B] text-white shadow-md'
                    : 'border border-gray-200 bg-white text-gray-900 hover:border-gray-300'
                } `}
              >
                {slot.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
