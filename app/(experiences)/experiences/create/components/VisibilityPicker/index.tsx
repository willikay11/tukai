'use client';

import { PillRadioGroup } from '@/components/ui/pillRadioGroup';

interface VisibilityPickerProps {
  value: 'public' | 'private';
  onChange: (value: 'public' | 'private') => void;
}

export const VisibilityPicker = ({ value, onChange }: VisibilityPickerProps) => {
  const options = [
    { value: 'public', label: 'Public (Everyone)' },
    { value: 'private', label: 'Private (Only invited people)' },
  ];
  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-gray-800">
        Experience visibility (who can see or access the experience)
      </label>
      <div className="w-fit">
        <PillRadioGroup
          options={options}
          value={value}
          onChange={(selectedValue) => onChange(selectedValue as 'public' | 'private')}
        />
      </div>
    </div>
  );
};
