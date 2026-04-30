'use client';

import { PillRadioGroup } from '@/components/ui/pillRadioGroup';

export interface ExperienceTypePickerProps {
  value: 'paid' | 'free';
  onChange: (value: 'paid' | 'free') => void;
}

export const ExperienceTypePicker = ({ value, onChange }: ExperienceTypePickerProps) => {
  const options = [
    { value: 'paid', label: 'Paid Experience' },
    { value: 'free', label: 'Free Experience' },
  ];

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-900">
        Is this a free or a paid Experience?
      </label>
      <PillRadioGroup
        options={options}
        value={value}
        onChange={(selectedValue) => onChange(selectedValue as 'paid' | 'free')}
      />
    </div>
  );
};
