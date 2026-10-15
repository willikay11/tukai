'use client';

import { useEffect, useMemo, useState } from 'react';

import moment from 'moment';
import { RRule } from 'rrule';

import { IconComponent } from '@/app/shared/components/Icons';
import { formatFullDayLabel } from '@/utils/recurrence-utils';

interface RecurringTimeSlot {
  id: string;
  label: string;
  // A slot whose occurrence has already ended - shown struck through and
  // unselectable rather than left out, so the reader sees the full day's
  // schedule instead of a silently shrinking list
  isPast?: boolean;
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
const DAYS_PER_PAGE = 7;

export const RecurringDateSlotPicker = ({
  recurrenceRule,
  timeSlots,
  selectedDate,
  onDateChange,
  selectedSlotId,
  onSlotChange,
}: RecurringDateSlotPickerProps) => {
  const [page, setPage] = useState(0);

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

  // Keeps the visible week in step with the selected date - picking a day on
  // one page, or a reset back to the first occurrence, must not strand the
  // reader looking at a page that no longer holds the selected pill
  useEffect(() => {
    if (!parsed || !selectedDate) return;
    const index = parsed.days.findIndex((day) => day.date === selectedDate);
    if (index >= 0) setPage(Math.floor(index / DAYS_PER_PAGE));
  }, [parsed, selectedDate]);

  if (!parsed) {
    return null;
  }

  const totalPages = Math.max(1, Math.ceil(parsed.days.length / DAYS_PER_PAGE));
  const visibleDays = parsed.days.slice(page * DAYS_PER_PAGE, page * DAYS_PER_PAGE + DAYS_PER_PAGE);
  const monthLabel = moment(
    visibleDays[0]?.date ?? selectedDate ?? firstEnabledDate ?? undefined,
  ).format('MMMM YYYY');

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <p className="text-xl font-bold text-gray-900">Select date and slot</p>
        {parsed.daysLabel && (
          <p className="text-xs font-medium text-ink-muted">Recurs Every {parsed.daysLabel}</p>
        )}
      </div>

      <div className="space-y-4 rounded-2xl border border-gray-200 bg-gray-50 p-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setPage((current) => Math.max(current - 1, 0))}
            disabled={page === 0}
            aria-label="Previous dates"
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors disabled:opacity-40 enabled:hover:text-gray-700"
          >
            <IconComponent iconName="ArrowLeft01Icon" size={18} color="currentColor" />
          </button>

          <p className="text-sm font-bold text-gray-900">{monthLabel}</p>

          <button
            type="button"
            onClick={() => setPage((current) => Math.min(current + 1, totalPages - 1))}
            disabled={page >= totalPages - 1}
            aria-label="Next dates"
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors disabled:opacity-40 enabled:hover:text-gray-700"
          >
            <IconComponent iconName="ArrowRight01Icon" size={18} color="currentColor" />
          </button>
        </div>

        {visibleDays.length === 0 ? (
          <p className="text-xs text-gray-500">No upcoming dates for this experience.</p>
        ) : (
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {visibleDays.map((day) => {
              const isSelected = day.date === selectedDate;
              return (
                <button
                  key={day.date}
                  type="button"
                  disabled={!day.enabled}
                  onClick={() => onDateChange(day.date)}
                  aria-label={moment(day.date).format('ddd, MMM D')}
                  className={`flex flex-shrink-0 items-center gap-1.5 rounded-full px-4 py-2.5 text-sm transition-colors ${
                    isSelected
                      ? 'bg-emerald-100 text-primary'
                      : day.enabled
                        ? 'border border-gray-200 bg-white text-gray-900 hover:border-gray-300'
                        : 'cursor-not-allowed bg-gray-100 text-gray-400'
                  } `}
                >
                  <span>{moment(day.date).format('ddd')}</span>
                  <span className="font-bold">{moment(day.date).format('D')}</span>
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
                disabled={slot.isPast}
                onClick={() => onSlotChange(slot.id)}
                className={`rounded-full px-5 py-3 text-xs font-normal transition-colors ${
                  slot.isPast
                    ? 'cursor-not-allowed bg-gray-100 text-gray-400 line-through'
                    : isSelected
                      ? 'bg-gradient-to-b from-[#047857] to-[#064E3B] text-white shadow-md'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
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
