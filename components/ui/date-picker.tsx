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
  /**
   * The span this field is one end of. Given either, the calendar shades the
   * days between them, so a pair of fields reads as one range rather than as
   * two unrelated days - the canvas's `range-start` and `range-end`.
   */
  rangeStart?: string;
  rangeEnd?: string;
}

/** The two dates of a span, as Dates, or nothing when the span is incomplete. */
const spanOf = (rangeStart?: string, rangeEnd?: string) => {
  const from = rangeStart ? new Date(rangeStart) : undefined;
  const to = rangeEnd ? new Date(rangeEnd) : undefined;

  if (!from || !to || Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return null;
  if (to < from) return null;

  return { from, to };
};

const DatePicker = React.forwardRef<HTMLButtonElement, DatePickerProps>(
  (
    {
      className,
      value,
      onChange,
      placeholder = 'Select Date',
      disabled,
      minDate,
      maxDate,
      rangeStart,
      rangeEnd,
    },
    ref,
  ) => {
    const [date, setDate] = React.useState<Date | undefined>(value ? new Date(value) : undefined);
    const [open, setOpen] = React.useState(false);
    const span = spanOf(rangeStart, rangeEnd);

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
              // 56px, the canvas's own field height. It sits beside the
              // TimePicker in a two-column grid, so the pair have to agree.
              'flex h-14 w-full items-center justify-between rounded-[14px] border border-gray-200 px-3 py-2.5 text-left text-xs placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50',
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
            // The span is shaded through modifiers rather than range mode: this
            // field still picks one day, it just shows which span that day is
            // an end of
            modifiers={
              span
                ? {
                    spanStart: span.from,
                    spanEnd: span.to,
                    spanMiddle: { after: span.from, before: span.to },
                  }
                : undefined
            }
            modifiersClassNames={{
              spanStart: 'rounded-l-md bg-surface-brand',
              spanMiddle: 'rounded-none bg-surface-brand',
              spanEnd: 'rounded-r-md bg-surface-brand',
            }}
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
