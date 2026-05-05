'use client';

import { useCallback } from 'react';

type DayOfWeek = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

interface RecurringDayPickerProps {
  value: DayOfWeek[];
  onChange: (days: DayOfWeek[]) => void;
}

const DAYS = [
  { key: 'mon' as DayOfWeek, label: 'Mon' },
  { key: 'tue' as DayOfWeek, label: 'Tue' },
  { key: 'wed' as DayOfWeek, label: 'Wed' },
  { key: 'thu' as DayOfWeek, label: 'Thu' },
  { key: 'fri' as DayOfWeek, label: 'Fri' },
  { key: 'sat' as DayOfWeek, label: 'Sat' },
  { key: 'sun' as DayOfWeek, label: 'Sun' },
];

export const RecurringDayPicker = ({ value, onChange }: RecurringDayPickerProps) => {
  const handleDayToggle = useCallback(
    (day: DayOfWeek) => {
      if (value.includes(day)) {
        onChange(value.filter((d) => d !== day));
      } else {
        onChange([...value, day]);
      }
    },
    [value, onChange],
  );

  return (
    <div className="space-y-3">
      <label className="block text-xs font-medium text-gray-900">Select Days</label>
      <div className="flex flex-wrap gap-2">
        {DAYS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => handleDayToggle(key)}
            className={`rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
              value.includes(key)
                ? 'bg-emerald-700 text-white'
                : 'border-2 border-gray-300 bg-white text-gray-700 hover:border-gray-400'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
};
