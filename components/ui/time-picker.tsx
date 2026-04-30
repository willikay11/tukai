'use client';

import * as React from 'react';

import { IconComponent } from '@/app/shared/components/Icons';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export interface TimePickerProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const ROW_HEIGHT = 32;
const VISIBLE_ROWS = 5;
const DRUM_HEIGHT = ROW_HEIGHT * VISIBLE_ROWS;
const PADDING_ROWS = 2;

const HOURS_ARRAY = Array.from({ length: 12 }, (_, i) => 
  (i + 1).toString().padStart(2, '0')
);
const MINUTES_ARRAY = Array.from({ length: 60 }, (_, i) => 
  i.toString().padStart(2, '0')
);
const PERIOD_ARRAY = ['AM', 'PM'];

const TimePicker = React.forwardRef<HTMLButtonElement, TimePickerProps>(
  ({ className, value, onChange, placeholder = 'Select time', disabled }, ref) => {
    const [open, setOpen] = React.useState(false);
    const hoursRef = React.useRef<HTMLDivElement>(null);
    const minutesRef = React.useRef<HTMLDivElement>(null);
    const periodRef = React.useRef<HTMLDivElement>(null);

    const [hours, setHours] = React.useState('12');
    const [minutes, setMinutes] = React.useState('00');
    const [period, setPeriod] = React.useState<'AM' | 'PM'>('AM');

    // Initialize from value
    React.useEffect(() => {
      if (value && open) {
        const [time] = value.split(' ');
        const [h, m] = time.split(':');
        const hour = parseInt(h, 10);

        if (hour === 0) {
          setHours('12');
          setPeriod('AM');
        } else if (hour < 12) {
          setHours(hour.toString().padStart(2, '0'));
          setPeriod('AM');
        } else if (hour === 12) {
          setHours('12');
          setPeriod('PM');
        } else {
          setHours((hour - 12).toString().padStart(2, '0'));
          setPeriod('PM');
        }
        setMinutes(m || '00');
      }
    }, [value, open]);

    // Scroll to position on open
    React.useEffect(() => {
      if (open) {
        const scrollToIndex = (ref: React.RefObject<HTMLDivElement>, index: number) => {
          if (ref.current) {
            const scrollPos = (index + PADDING_ROWS) * ROW_HEIGHT;
            ref.current.scrollTop = scrollPos;
          }
        };

        const hoursIndex = HOURS_ARRAY.indexOf(hours.padStart(2, '0'));
        const minutesIndex = parseInt(minutes, 10);
        const periodIndex = PERIOD_ARRAY.indexOf(period);

        scrollToIndex(hoursRef, hoursIndex);
        scrollToIndex(minutesRef, minutesIndex);
        scrollToIndex(periodRef, periodIndex);
      }
    }, [open, hours, minutes, period]);

    const getOpacity = (scrollTop: number, itemIndex: number) => {
      const centerPos = scrollTop + DRUM_HEIGHT / 2;
      const itemPos = (itemIndex + PADDING_ROWS) * ROW_HEIGHT + ROW_HEIGHT / 2;
      const distance = Math.abs(centerPos - itemPos) / ROW_HEIGHT;

      if (distance < 0.5) return 1;
      if (distance < 1.5) return 0.6;
      if (distance < 2.5) return 0.3;
      return 0;
    };

    const DrumColumn = ({
      items,
      ref,
      onValueChange,
    }: {
      items: string[];
      ref: React.RefObject<HTMLDivElement>;
      onValueChange: (value: string) => void;
    }) => {
      const [scrollTop, setScrollTop] = React.useState(0);

      const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const target = e.currentTarget;
        setScrollTop(target.scrollTop);

        const selectedIndex = Math.round(target.scrollTop / ROW_HEIGHT) - PADDING_ROWS;
        if (selectedIndex >= 0 && selectedIndex < items.length) {
          onValueChange(items[selectedIndex]);
        }
      };

      const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const target = e.currentTarget;
        const clickY = e.clientY - target.getBoundingClientRect().top;
        const clickedIndex = Math.round((scrollTop + clickY) / ROW_HEIGHT) - PADDING_ROWS;

        if (clickedIndex >= 0 && clickedIndex < items.length) {
          onValueChange(items[clickedIndex]);
          const newScrollPos = (clickedIndex + PADDING_ROWS) * ROW_HEIGHT;
          target.scrollTop = newScrollPos;
          setScrollTop(newScrollPos);
        }
      };

      return (
        <div
          ref={ref}
          onScroll={handleScroll}
          onClick={handleClick}
          className="relative overflow-y-scroll"
          style={{
            height: DRUM_HEIGHT,
            scrollSnapType: 'y mandatory',
            scrollBehavior: 'smooth',
          }}
        >
          {/* Top padding */}
          <div style={{ height: PADDING_ROWS * ROW_HEIGHT }} />

          {/* Items */}
          {items.map((item, index) => (
            <div
              key={item}
              style={{
                height: ROW_HEIGHT,
                scrollSnapAlign: 'center',
                opacity: getOpacity(scrollTop, index),
                transition: 'opacity 0.1s ease-out',
              }}
              className="flex items-center justify-center text-sm font-medium text-gray-900"
            >
              {item}
            </div>
          ))}

          {/* Bottom padding */}
          <div style={{ height: PADDING_ROWS * ROW_HEIGHT }} />

          {/* Center highlight */}
          <div
            className="pointer-events-none absolute left-0 right-0 border-t border-b border-gray-200 bg-gray-50"
            style={{
              top: (DRUM_HEIGHT - ROW_HEIGHT) / 2,
              height: ROW_HEIGHT,
            }}
          />
        </div>
      );
    };

    const handleSave = () => {
      if (onChange) {
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

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            ref={ref}
            type="button"
            disabled={disabled}
            className={cn(
              'flex h-[55px] w-full items-center justify-between rounded-lg border border-gray-200 px-3 py-2.5 text-left text-xs text-gray-700 placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50',
              !value && 'text-gray-400',
              className,
            )}
          >
            <span>{getDisplayValue()}</span>
            <IconComponent iconName="Clock01Icon" size={18} className="text-gray-400" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex items-center gap-0">
            {/* Hours */}
            <DrumColumn
              ref={hoursRef}
              items={HOURS_ARRAY}
              onValueChange={setHours}
            />

            {/* Separator */}
            <div className="flex h-[160px] items-center px-1 text-sm font-medium text-gray-900">
              :
            </div>

            {/* Minutes */}
            <DrumColumn
              ref={minutesRef}
              items={MINUTES_ARRAY}
              onValueChange={setMinutes}
            />

            {/* Period */}
            <DrumColumn
              ref={periodRef}
              items={PERIOD_ARRAY}
              onValueChange={(p) => setPeriod(p as 'AM' | 'PM')}
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-gray-200 px-3 py-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-sm font-medium text-red-600 hover:text-red-700"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="text-sm font-medium text-gray-900 hover:text-gray-700"
            >
              Save
            </button>
          </div>
        </PopoverContent>
      </Popover>
    );
  },
);

TimePicker.displayName = 'TimePicker';

export { TimePicker };
