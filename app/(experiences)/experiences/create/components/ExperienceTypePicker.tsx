'use client';

import { useCallback } from 'react';

import { cn } from '@/lib/utils';

export interface ExperienceTypePickerProps {
  value: 'paid' | 'free';
  onChange: (value: 'paid' | 'free') => void;
}

export const ExperienceTypePicker = ({ value, onChange }: ExperienceTypePickerProps) => {
  const handlePaid = useCallback(() => onChange('paid'), [onChange]);
  const handleFree = useCallback(() => onChange('free'), [onChange]);

  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-gray-900">
        Is this a free or a paid Experience?
      </label>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={handlePaid}
          className={cn(
            'flex-1 rounded-full px-4 py-2.5 text-sm font-medium transition-colors',
            value === 'paid'
              ? 'bg-emerald-600 text-white'
              : 'border border-gray-300 text-gray-600 hover:border-gray-400',
          )}
        >
          Paid Experience
        </button>

        <button
          type="button"
          onClick={handleFree}
          className={cn(
            'flex-1 rounded-full px-4 py-2.5 text-sm font-medium transition-colors',
            value === 'free'
              ? 'bg-emerald-600 text-white'
              : 'border border-gray-300 text-gray-600 hover:border-gray-400',
          )}
        >
          Free Experience
        </button>
      </div>
    </div>
  );
};
