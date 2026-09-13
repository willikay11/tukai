'use client';

import { useMemo } from 'react';

import { cn } from '@/lib/utils';
import { PlaceAvailabilityException, PlaceAvailabilityRule } from '@/types/placeReservation';
import { isDateBookable, slotsForDate } from '@/utils/reservation-slots';

// How far ahead the weekly rules are projected. The API exposes no booking
// horizon, so this is ours.
const DAYS_AHEAD = 30;

const to12Hour = (time: string): string => {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hour = hours % 12 === 0 ? 12 : hours % 12;
  return `${hour}:${String(minutes).padStart(2, '0')} ${period}`;
};

export const DateTimePicker = ({
  rules,
  exceptions,
  selectedDate,
  selectedTime,
  onSelectDate,
  onSelectTime,
}: {
  rules: PlaceAvailabilityRule[];
  exceptions: PlaceAvailabilityException[];
  selectedDate: Date | null;
  selectedTime: string | null;
  onSelectDate: (date: Date) => void;
  onSelectTime: (time: string) => void;
}) => {
  const days = useMemo(() => {
    const today = new Date();
    return Array.from({ length: DAYS_AHEAD }, (_, offset) => {
      const date = new Date(today);
      date.setDate(today.getDate() + offset);
      return date;
    }).filter((date) => isDateBookable(date, rules, exceptions));
  }, [rules, exceptions]);

  const times = selectedDate ? slotsForDate(selectedDate, rules, exceptions) : [];

  if (days.length === 0) {
    return (
      <p className="py-6 text-sm text-gray-400">
        This place has no open hours set, so there is nothing to book yet.
      </p>
    );
  }

  // The strip can span a month boundary; the label follows whichever month the
  // reader is looking at rather than always naming the first day's
  const monthLabel = (selectedDate ?? days[0]).toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="space-y-5">
      <div>
        <p className="mb-3 text-sm text-gray-400">{monthLabel}</p>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {days.map((date) => {
            const isSelected = selectedDate?.toDateString() === date.toDateString();
            return (
              <button
                key={date.toISOString()}
                type="button"
                onClick={() => onSelectDate(date)}
                aria-pressed={isSelected}
                className={cn(
                  'flex h-[72px] w-[68px] flex-shrink-0 flex-col items-center justify-center gap-1 rounded-xl border transition-colors',
                  // The light green the rest of the app selects with — the same
                  // treatment as the name presets above and the reservations
                  // calendar's day pills
                  isSelected
                    ? 'border-green-200 bg-green-200 font-medium text-primary'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300',
                )}
              >
                <span className={cn('text-xs', isSelected ? 'text-primary/70' : 'text-gray-400')}>
                  {date.toLocaleDateString(undefined, { weekday: 'short' })}
                </span>
                <span className="text-lg font-bold">{date.getDate()}</span>
              </button>
            );
          })}
        </div>
      </div>

      {selectedDate && (
        <div>
          <p className="mb-3 text-sm font-medium text-gray-800">Time slot</p>
          <div className="flex flex-wrap gap-2">
            {times.map((time) => (
              <button
                key={time}
                type="button"
                onClick={() => onSelectTime(time)}
                aria-pressed={selectedTime === time}
                className={cn(
                  'rounded-full border px-5 py-2.5 text-sm transition-colors',
                  selectedTime === time
                    ? 'border-green-200 bg-green-200 font-medium text-primary'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300',
                )}
              >
                {to12Hour(time)}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
