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
      <div className="justity-center inline-flex items-center space-x-2">
        {DAYS.map(({ key, label }) => (
          <div key={key} className="flex items-center gap-1">
            <Checkbox
              id={`day-${key}`}
              checked={value.includes(key)}
              onCheckedChange={() => handleDayToggle(key)}
            />
            <Label
              htmlFor={`day-${key}`}
              className="cursor-pointer text-xs font-medium text-gray-900"
            >
              {label}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
};
