'use client';

import { useCallback, useEffect, useState } from 'react';

import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from "@/components/ui/switch"

const experienceTypeOptions = [
  { value: 'one-time', label: 'One-Time/Day Experience' },
  { value: 'multi-day', label: 'Multi-Day Experience (e.g., 2 days straight)' },
  { value: 'itinerary', label: 'Itinerary' },
];
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

  useEffect(() => {
    setExperienceType(value);
  }, [value]);

  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-gray-900">Experience Type</label>

      <div className="flex flex-wrap gap-2">
        {experienceTypeOptions.map((option: { value: string; label: string }) => {
          const isSelected = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                setExperienceType(option.value as 'one-time' | 'multi-day' | 'itinerary');
                onChange(option.value as 'one-time' | 'multi-day' | 'itinerary');
              }}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-3 text-xs font-medium transition-colors ${
                isSelected
                  ? 'border-primary bg-gradient-to-b from-[#047857] to-[#064E3B] text-white'
                  : 'bg-gray-100 text-gray-700 hover:border-gray-400'
              } `}
            >
              <span>{option.label}</span>
            </button>
          );
        })}
      </div>

      {experienceType === 'one-time' && (
        <div className="flex items-center space-x-2 pt-4">
          <Switch id="recurring" checked={isRecurring} onCheckedChange={handleRecurringChange} />
          <label htmlFor="recurring" className="cursor-pointer text-xs font-medium text-gray-900">
            Make this a recurring experience
          </label>
        </div>
      )}
    </div>
  );
};
