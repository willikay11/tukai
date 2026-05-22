'use client';

import { useCallback } from 'react';

import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface MultiDayTicketModePickerProps {
  value: 'entire-period' | 'each-day';
  onChange: (value: 'entire-period' | 'each-day') => void;
}

export const MultiDayTicketModePicker = ({ value, onChange }: MultiDayTicketModePickerProps) => {
  const handleChange = useCallback(
    (newValue: string) => {
      onChange(newValue as 'entire-period' | 'each-day');
    },
    [onChange],
  );

  return (
    <div className="space-y-3">
      <label className="block text-xs text-gray-900">
        How would you like to create tickets for this experience?
      </label>

      <RadioGroup value={value} onValueChange={handleChange}>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <RadioGroupItem value="entire-period" id="entire-period" className="h-4 w-4" />
            <Label htmlFor="entire-period" className="cursor-pointer text-xs text-gray-900">
              Create one ticket setup for the entire period
            </Label>
          </div>

          <div className="flex items-center gap-3">
            <RadioGroupItem value="each-day" id="each-day" className="h-4 w-4" />
            <Label htmlFor="each-day" className="cursor-pointer text-xs text-gray-900">
              Create tickets for each day separately
            </Label>
          </div>
        </div>
      </RadioGroup>
    </div>
  );
};
