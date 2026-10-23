'use client';

import { useState } from 'react';

import { DayPicker } from 'react-day-picker';

import { format, isBefore, isValid, parseISO, startOfDay } from 'date-fns';

import { IconComponent } from '@/app/shared/components/Icons';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export interface DateFieldProps {
  label: string;
  value: string | null; // ISO "yyyy-MM-dd"
  onChange: (value: string) => void;
  minDate?: Date;
  maxDate?: Date;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * The canvas's Date field: a button that shows a floating label once a date
 * is picked, opening a popover calendar below it (tk-pop / tk-cal). 44px
 * circular day cells, a dot under today, a ring around the other end of a
 * range (not used here - every call site in this flow picks one date at a
 * time) and disabled past dates via `minDate`.
 */
export const DateField = ({
  label,
  value,
  onChange,
  minDate,
  maxDate,
  placeholder,
  error,
  disabled,
  className,
}: DateFieldProps) => {
  const [open, setOpen] = useState(false);

  const parsed = value ? parseISO(value) : undefined;
  const selected = parsed && isValid(parsed) ? parsed : undefined;

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            disabled={disabled}
            aria-expanded={open}
            className={cn(
              'flex h-14 w-full items-center gap-3 rounded-xl border border-line bg-white px-4 text-left outline-none',
              'focus:border-brand focus:shadow-[0_0_0_3px_#E8F1ED]',
              open && 'border-brand shadow-[0_0_0_3px_#E8F1ED]',
              error && 'border-danger-deep',
              disabled && 'cursor-not-allowed opacity-50',
            )}
          >
            <span className="flex min-w-0 flex-1 flex-col justify-center gap-0.5">
              {selected ? (
                <>
                  <span className="text-[12.5px] leading-tight text-ink-muted">{label}</span>
                  <span className="truncate text-15 leading-tight text-gray-800 [font-variant-numeric:tabular-nums]">
                    {format(selected, 'EEE, d MMM yyyy')}
                  </span>
                </>
              ) : (
                <span className="truncate text-15 leading-tight text-ink-muted">
                  {placeholder ?? label}
                </span>
              )}
            </span>
            <IconComponent
              iconName="Calendar03Icon"
              size={20}
              color="#5B6B66"
              className="flex-shrink-0"
            />
          </button>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          sideOffset={6}
          className="w-auto rounded-[18px] p-3 shadow-[0_0_0_1px_rgba(1,51,52,.06),0_14px_36px_rgba(1,51,52,.16)]"
        >
          <DayPicker
            mode="single"
            selected={selected}
            defaultMonth={selected ?? minDate ?? new Date()}
            disabled={(date) => {
              if (minDate && isBefore(startOfDay(date), startOfDay(minDate))) return true;
              if (maxDate && isBefore(startOfDay(maxDate), startOfDay(date))) return true;
              return false;
            }}
            onSelect={(date) => {
              if (!date) return;
              onChange(format(date, 'yyyy-MM-dd'));
              setOpen(false);
            }}
            classNames={{
              months: 'flex flex-col gap-2',
              month: 'flex flex-col gap-2',
              month_caption: 'flex h-11 items-center justify-center px-11',
              caption_label: 'text-base font-semibold text-gray-800',
              nav: 'flex items-center justify-between absolute inset-x-0 top-0',
              button_previous:
                'flex h-11 w-11 items-center justify-center rounded-full text-brand-ink hover:bg-surface disabled:pointer-events-none disabled:opacity-35',
              button_next:
                'flex h-11 w-11 items-center justify-center rounded-full text-brand-ink hover:bg-surface disabled:pointer-events-none disabled:opacity-35',
              weekdays: 'flex',
              weekday: 'h-8 flex-1 flex items-center justify-center text-[12.5px] font-medium text-ink-muted',
              week: 'flex mt-0.5 gap-0.5',
              day: 'h-11 w-11 p-0 flex items-center justify-center',
              today: 'font-bold',
              selected: '',
              outside: 'opacity-0 pointer-events-none',
              disabled: 'opacity-0 pointer-events-none',
              hidden: 'invisible',
            }}
            components={{
              Chevron: ({ orientation }) => (
                <IconComponent
                  iconName={orientation === 'left' ? 'ArrowLeft01Icon' : 'ArrowRight01Icon'}
                  size={20}
                  color="currentColor"
                />
              ),
              DayButton: ({ day, modifiers, className: dayClassName, ...dayProps }) => (
                <button
                  type="button"
                  {...dayProps}
                  className={cn(
                    'relative flex h-11 w-11 select-none items-center justify-center rounded-full text-[14.5px] font-medium text-gray-800 outline-none [font-variant-numeric:tabular-nums]',
                    'hover:shadow-[inset_0_0_0_1.5px_#066349] focus:shadow-[inset_0_0_0_2px_#066349]',
                    modifiers.selected && 'bg-brand font-bold text-white hover:shadow-none',
                    modifiers.disabled && 'pointer-events-none text-[#B4BEB9]',
                    dayClassName,
                  )}
                >
                  {day.date.getDate()}
                  {modifiers.today && !modifiers.selected && (
                    <span className="absolute bottom-[6px] left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-brand" />
                  )}
                  {modifiers.today && modifiers.selected && (
                    <span className="absolute bottom-[6px] left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-white" />
                  )}
                </button>
              ),
            }}
          />
        </PopoverContent>
      </Popover>

      {error && <span className="text-[13.5px] leading-tight text-danger-deep">{error}</span>}
    </div>
  );
};
