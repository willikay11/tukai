'use client';

import { useCallback } from 'react';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

type DayOfWeek = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

interface RecurringDayPickerProps {
  value: DayOfWeek[];
  onChange: (days: DayOfWeek[]) => void;
}

const DAYS = [
  { key: 'sun' as DayOfWeek, label: 'Sun' },
  { key: 'mon' as DayOfWeek, label: 'Mon' },
  { key: 'tue' as DayOfWeek, label: 'Tue' },
  { key: 'wed' as DayOfWeek, label: 'Wed' },
  { key: 'thu' as DayOfWeek, label: 'Thu' },
  { key: 'fri' as DayOfWeek, label: 'Fri' },
  { key: 'sat' as DayOfWeek, label: 'Sat' },
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
      <div className="justity-center inline-flex items-center space-x-2">
        {DAYS.map(({ key, label }) => (
          <div key={key} className="flex items-center gap-1">
            <button
              key={`day-${key}`}
              type="button"
              onClick={() => {
                handleDayToggle(key);
              }}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium transition-colors ${
                value.includes(key)
                  ? 'border-primary bg-gradient-to-b from-[#047857] to-[#064E3B] text-white'
                  : 'bg-gray-100 text-gray-700 hover:border-gray-400'
              } `}
            >
              <span>{label}</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
