'use client';

import { PillRadioGroup } from '@/components/ui/pillRadioGroup';

interface EditVisibilityFieldProps {
  value: 'public' | 'private';
  onChange: (visibility: 'public' | 'private') => void;
  error?: string;
}

export const EditVisibilityField = ({ value, onChange, error }: EditVisibilityFieldProps) => {
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
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};
