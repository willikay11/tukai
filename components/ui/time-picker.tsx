'use client';

import * as React from 'react';

import { IconComponent } from '@/app/shared/components/Icons';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export interface TimePickerProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const TimePicker = React.forwardRef<HTMLButtonElement, TimePickerProps>(
  ({ className, value, onChange, placeholder = 'Select time', disabled }, ref) => {
    const [open, setOpen] = React.useState(false);
    const [hours, setHours] = React.useState('12');
    const [minutes, setMinutes] = React.useState('00');
    const [period, setPeriod] = React.useState<'AM' | 'PM'>('AM');

    React.useEffect(() => {
      if (value) {
        const [time] = value.split(' ');
        const [h, m] = time.split(':');
        const hour = parseInt(h, 10);

        if (hour === 0) {
          setHours('12');
          setPeriod('AM');
        } else if (hour < 12) {
          setHours(hour.toString());
          setPeriod('AM');
        } else if (hour === 12) {
          setHours('12');
          setPeriod('PM');
        } else {
          setHours((hour - 12).toString());
          setPeriod('PM');
        }
        setMinutes(m || '00');
      }
    }, [value]);

    const handleHoursChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      setHours(e.target.value);
    };

    const handleMinutesChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      setMinutes(e.target.value);
    };

    const handlePeriodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      setPeriod(e.target.value as 'AM' | 'PM');
    };

    const handleNow = () => {
      const now = new Date();
      let hour = now.getHours();
      const minute = now.getMinutes();

      const newPeriod = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;

      setHours(displayHour.toString());
      setMinutes(minute.toString().padStart(2, '0'));
      setPeriod(newPeriod);
    };

    const handleOk = () => {
      if (hours && minutes && onChange) {
        let hour24 = parseInt(hours, 10);
        if (period === 'PM' && hour24 !== 12) {
          hour24 += 12;
        } else if (period === 'AM' && hour24 === 12) {
          hour24 = 0;
        }
        const formattedTime = `${hour24.toString().padStart(2, '0')}:${minutes.padStart(2, '0')}`;
        onChange(formattedTime);
      }
      setOpen(false);
    };

    const getDisplayValue = () => {
      if (!value) return placeholder;
      const [h, m] = value.split(':');
      const hour = parseInt(h, 10);
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      const displayPeriod = hour >= 12 ? 'PM' : 'AM';
      return `${displayHour}:${m} ${displayPeriod}`;
    };

    // Generate hours array (1-12)
    const hoursArray = Array.from({ length: 12 }, (_, i) => (i + 1).toString());

    // Generate minutes array (00-59)
    const minutesArray = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            ref={ref}
            type="button"
            disabled={disabled}
            className={cn(
              'flex h-[50px] w-full items-center justify-between rounded-lg border border-gray-200 px-3 py-2.5 text-left text-xs text-gray-700 placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50',
              !value && 'text-gray-400',
              className,
            )}
          >
            <span>{getDisplayValue()}</span>
            <IconComponent iconName="Clock01Icon" size={18} className="text-gray-400" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex gap-2 p-3">
            <div className="flex flex-col">
              <select
                value={hours}
                onChange={handleHoursChange}
                className="h-32 w-16 overflow-y-auto rounded border border-gray-200 px-2 py-1 text-center text-sm focus:border-emerald-500 focus:outline-none"
                size={6}
              >
                {hoursArray.map((hour) => (
                  <option key={hour} value={hour}>
                    {hour}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center text-gray-500">:</div>

            <div className="flex flex-col">
              <select
                value={minutes}
                onChange={handleMinutesChange}
                className="h-32 w-16 overflow-y-auto rounded border border-gray-200 px-2 py-1 text-center text-sm focus:border-emerald-500 focus:outline-none"
                size={6}
              >
                {minutesArray.map((minute) => (
                  <option key={minute} value={minute}>
                    {minute}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col">
              <select
                value={period}
                onChange={handlePeriodChange}
                className="h-32 w-16 overflow-y-auto rounded border border-gray-200 px-2 py-1 text-center text-sm focus:border-emerald-500 focus:outline-none"
                size={2}
              >
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-gray-200 px-3 py-2">
            <button
              type="button"
              onClick={handleNow}
              className="text-sm text-emerald-600 hover:text-emerald-700"
            >
              Now
            </button>
            <Button
              type="button"
              onClick={handleOk}
              size="sm"
              className="rounded bg-gray-200 px-4 text-sm text-gray-700 hover:bg-gray-300"
            >
              OK
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    );
  },
);

TimePicker.displayName = 'TimePicker';

export { TimePicker };
