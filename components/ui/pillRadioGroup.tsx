import React from 'react';

interface PillRadioOption {
  value: string;
  label: string;
}

interface PillRadioGroupProps {
  options: PillRadioOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function PillRadioGroup({ options, value, onChange, className = '' }: PillRadioGroupProps) {
  return (
    <div className={`inline-flex rounded-full bg-gray-100 p-1.5 space-x-1.5 ${className}`}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`
            rounded-full px-4 py-2 text-xs font-medium 
            transition-all duration-300 ease-in-out
            ${
              value === option.value
                ? 'bg-gradient-to-b to-[#064E3B] from-[#047857] text-white shadow-sm'
                : 'bg-white border border-gray-100 text-gray-700 hover:text-gray-900'
            }
          `}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
