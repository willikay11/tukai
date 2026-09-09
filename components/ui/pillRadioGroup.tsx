import React from 'react';

import { IconComponent } from '@/app/shared/components/Icons';
import { cn } from '@/lib/utils';

interface PillRadioOption {
  value: string;
  label: string;
  /** Offered but not choosable — a lock icon says why without a tooltip */
  disabled?: boolean;
  /** A hugeicon name, drawn after the label */
  icon?: string;
}

interface PillRadioGroupProps {
  options: PillRadioOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function PillRadioGroup({ options, value, onChange, className = '' }: PillRadioGroupProps) {
  return (
    <div className={`inline-flex space-x-1.5 rounded-full ${className}`}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          disabled={option.disabled}
          aria-disabled={option.disabled}
          onClick={() => !option.disabled && onChange(option.value)}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium transition-all duration-300 ease-in-out',
            value === option.value
              ? 'bg-gradient-to-b from-[#047857] to-[#064E3B] text-white shadow-sm'
              : 'border border-gray-100 bg-gray-100 text-gray-700 hover:text-gray-900',
            // Still readable, and plainly not pressable
            option.disabled && 'cursor-not-allowed opacity-60 hover:text-gray-700',
          )}
        >
          {option.label}
          {option.icon && <IconComponent iconName={option.icon} size={14} color="currentColor" />}
        </button>
      ))}
    </div>
  );
}
