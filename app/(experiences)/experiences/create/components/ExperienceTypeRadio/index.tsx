'use client';

import { useCallback, useState } from 'react';

import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';

export interface ExperienceTypeRadioProps {
  value: 'one-time' | 'multi-day' | 'itinerary';
  onChange: (value: 'one-time' | 'multi-day' | 'itinerary') => void;
  isRecurring: boolean;
  onRecurringChange: (value: boolean) => void;
}

export const ExperienceTypeRadio = ({
  value,
  onChange,
  isRecurring,
  onRecurringChange,
}: ExperienceTypeRadioProps) => {
  const [experienceType, setExperienceType] = useState<'one-time' | 'multi-day' | 'itinerary'>(
    value,
  );
  const handleRecurringChange = useCallback(
    (checked: boolean) => {
      onRecurringChange(checked);
    },
    [onRecurringChange],
  );

  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-gray-900">Experience Type</label>

      <RadioGroup
        value={experienceType}
        onValueChange={(value: 'one-time' | 'multi-day' | 'itinerary') => {
          setExperienceType(value);
          onChange(value);
        }}
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="one-time" id="one-time" />
          <label htmlFor="one-time" className="cursor-pointer text-xs font-medium text-gray-900">
            One-Time/Day Experience
          </label>
        </div>

        <div className="flex items-center space-x-2">
          <RadioGroupItem value="multi-day" id="multi-day" />
          <label htmlFor="multi-day" className="cursor-pointer text-xs font-medium text-gray-900">
            Multi-Day Experience (e.g., 2 days straight)
          </label>
        </div>

        <div className="flex items-center space-x-2">
          <RadioGroupItem value="itinerary" id="itinerary" />
          <label htmlFor="itinerary" className="cursor-pointer text-xs font-medium text-gray-900">
            Itinerary
          </label>
        </div>
      </RadioGroup>

      {experienceType === 'one-time' && (
        <div className="flex items-center space-x-2 pt-2">
          <Checkbox id="recurring" checked={isRecurring} onCheckedChange={handleRecurringChange} />
          <label htmlFor="recurring" className="cursor-pointer text-xs font-medium text-gray-900">
            Create a recurring experience
          </label>
        </div>
      )}
    </div>
  );
};
