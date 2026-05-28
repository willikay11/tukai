'use client';

import { Input } from '@/components/ui/input';

interface EditTitleFieldProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export const EditTitleField = ({ value, onChange, error }: EditTitleFieldProps) => {
  return (
    <div className="space-y-2">
      <label htmlFor="edit-title" className="text-xs font-medium text-gray-800">
        Experience Title
      </label>
      <Input
        id="edit-title"
        placeholder="Enter experience title"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={error ? 'border-red-500' : ''}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};
