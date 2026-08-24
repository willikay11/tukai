'use client';

import * as React from 'react';

import { format } from 'date-fns';

import { IconComponent } from '@/app/shared/components/Icons';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export interface DatePickerProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
}

const DatePicker = React.forwardRef<HTMLButtonElement, DatePickerProps>(
  (
    { className, value, onChange, placeholder = 'Select Date', disabled, minDate, maxDate },
    ref,
  ) => {
    const [date, setDate] = React.useState<Date | undefined>(value ? new Date(value) : undefined);
    const [open, setOpen] = React.useState(false);

    React.useEffect(() => {
      if (value) {
        setDate(new Date(value));
      }
    }, [value]);

    const handleSelect = (selectedDate: Date | undefined) => {
      setDate(selectedDate);
      if (selectedDate && onChange) {
        onChange(format(selectedDate, 'yyyy-MM-dd'));
      }
      // Picking a day completes the interaction, so dismiss the calendar. A
      // click on the already-selected day clears it instead, and the calendar
      // stays open so another day can be chosen
      if (selectedDate) {
        setOpen(false);
      }
    };

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            ref={ref}
            type="button"
            disabled={disabled}
            className={cn(
              // 44px, the height every field in the app settled on. It sits
              // beside the TimePicker in a two-column grid, so the pair have to
              // agree.
              'flex h-11 w-full items-center justify-between rounded-[14px] border border-gray-200 px-3 py-2.5 text-left text-xs placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50',
              !date && 'text-gray-400',
              date && 'text-gray-700',
              className,
            )}
          >
            {date ? format(date, 'PPP') : <span>{placeholder}</span>}
            <IconComponent iconName="Calendar01Icon" size={18} className="text-gray-800" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto rounded-[12px] p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleSelect}
            initialFocus
            disabled={[
              ...(minDate ? [{ before: minDate }] : []),
              ...(maxDate ? [{ after: maxDate }] : []),
            ]}
          />
        </PopoverContent>
      </Popover>
    );
  },
);

DatePicker.displayName = 'DatePicker';

export { DatePicker };
