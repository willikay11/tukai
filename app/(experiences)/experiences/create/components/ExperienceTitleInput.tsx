'use client';

import { Input } from '@/components/ui/input';

interface ExperienceTitleInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export const ExperienceTitleInput = ({ value, onChange, error }: ExperienceTitleInputProps) => {
  return (
    <div className="space-y-2">
      <label htmlFor="experience-title" className="text-xs font-medium text-gray-800">
        Experience Title
      </label>
      <Input
        id="experience-title"
        placeholder="Enter experience title"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={error ? 'border-red-500' : ''}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};
