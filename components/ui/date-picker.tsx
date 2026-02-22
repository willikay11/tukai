'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import IconComponent from '@/app/components/iconComponent';

export interface DatePickerProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const DatePicker = React.forwardRef<HTMLInputElement, DatePickerProps>(
  ({ className, value, onChange, placeholder = 'Select Date', disabled }, ref) => {
    const inputRef = React.useRef<HTMLInputElement>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (onChange) {
        onChange(e.target.value);
      }
    };

    const handleClick = () => {
      inputRef.current?.showPicker();
    };

    return (
      <div className="relative">
        <input
          ref={inputRef}
          type="date"
          value={value || ''}
          onChange={handleChange}
          disabled={disabled}
          className={cn(
            'w-full h-[55px] rounded-lg border border-gray-200 px-3 py-2.5 pr-10 text-sm text-gray-700 focus:border-emerald-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50',
            !value && 'text-gray-400',
            className
          )}
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={handleClick}
          disabled={disabled}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
        >
          <IconComponent iconName="Calendar01Icon" size={18} />
        </button>
      </div>
    );
  }
);

DatePicker.displayName = 'DatePicker';

export { DatePicker };
