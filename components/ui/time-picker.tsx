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
  /**
   * Earliest time ("HH:MM") that can be saved. Anything at or before it is
   * blocked — used to stop an end time landing before its start time.
   */
  minTime?: string;
}

const ROW_HEIGHT = 28;
const VISIBLE_ROWS = 5;
const DRUM_HEIGHT = ROW_HEIGHT * VISIBLE_ROWS;
const PADDING_ROWS = 2;

const HOURS_ARRAY = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
const MINUTES_ARRAY = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));
const PERIOD_ARRAY = ['AM', 'PM'] as const;

type TimePeriod = (typeof PERIOD_ARRAY)[number];

const toMinutes = (time: string) => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

const formatTimeLabel = (time: string) => {
  const [h, m] = time.split(':');
  const hour = parseInt(h, 10);
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${displayHour}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
};

const splitTime = (time: string) => {
  const [h, m] = time.split(':');
  const hour = parseInt(h, 10);
  const period: TimePeriod = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;

  return {
    hours: displayHour.toString().padStart(2, '0'),
    minutes: m || '00',
    period,
  };
};

const getOpacity = (scrollTop: number, itemIndex: number) => {
  const centerPos = scrollTop + DRUM_HEIGHT / 2;
  const itemPos = (itemIndex + PADDING_ROWS) * ROW_HEIGHT + ROW_HEIGHT / 2;
  const distance = Math.abs(centerPos - itemPos) / ROW_HEIGHT;

  if (distance < 0.5) return 1;
  if (distance < 1.5) return 0.6;
  if (distance < 2.5) return 0.3;
  return 0;
};

interface DrumColumnProps {
  open: boolean;
  items: readonly string[];
  drumRef: React.RefObject<HTMLDivElement>;
  onValueChange: (value: string) => void;
  selectedValue: string;
  columnWidth?: string;
}

const DrumColumn = React.memo(
  ({ open, items, drumRef, onValueChange, selectedValue, columnWidth }: DrumColumnProps) => {
    const [scrollTop, setScrollTop] = React.useState(0);
    const lastSelectedIndexRef = React.useRef(-1);
    const snapTimeoutRef = React.useRef<number | null>(null);

    const clampIndex = React.useCallback(
      (index: number) => Math.max(0, Math.min(items.length - 1, index)),
      [items.length],
    );

    const snapToNearest = React.useCallback(
      (target: HTMLDivElement, smooth = true) => {
        const nearestIndex = clampIndex(Math.round(target.scrollTop / ROW_HEIGHT));
        const nextScrollPos = nearestIndex * ROW_HEIGHT;

        if (Math.abs(target.scrollTop - nextScrollPos) > 0.5) {
          target.scrollTo({
            top: nextScrollPos,
            behavior: smooth ? 'smooth' : 'auto',
          });
        }

        setScrollTop(nextScrollPos);
        if (nearestIndex !== lastSelectedIndexRef.current) {
          lastSelectedIndexRef.current = nearestIndex;
          onValueChange(items[nearestIndex]);
        }
      },
      [clampIndex, items, onValueChange],
    );

    React.useEffect(() => {
      if (!open || !drumRef.current) return;

      const selectedIndex = items.indexOf(selectedValue);
      if (selectedIndex < 0) return;

      const nextScrollPos = selectedIndex * ROW_HEIGHT;
      if (Math.abs(drumRef.current.scrollTop - nextScrollPos) > 1) {
        drumRef.current.scrollTop = nextScrollPos;
        setScrollTop(nextScrollPos);
      }

      lastSelectedIndexRef.current = selectedIndex;
    }, [open, drumRef, items, selectedValue]);

    React.useEffect(() => {
      return () => {
        if (snapTimeoutRef.current !== null) {
          window.clearTimeout(snapTimeoutRef.current);
        }
      };
    }, []);

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
      const target = e.currentTarget;
      setScrollTop(target.scrollTop);

      const selectedIndex = Math.round(target.scrollTop / ROW_HEIGHT);
      if (
        selectedIndex >= 0 &&
        selectedIndex < items.length &&
        selectedIndex !== lastSelectedIndexRef.current
      ) {
        lastSelectedIndexRef.current = selectedIndex;
        onValueChange(items[selectedIndex]);
      }

      if (snapTimeoutRef.current !== null) {
        window.clearTimeout(snapTimeoutRef.current);
      }

      snapTimeoutRef.current = window.setTimeout(() => {
        snapToNearest(target);
      }, 80);
    };

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
      const target = e.currentTarget;
      const clickY = e.clientY - target.getBoundingClientRect().top;
      const clickedIndex = clampIndex(
        Math.round((scrollTop + clickY - DRUM_HEIGHT / 2) / ROW_HEIGHT),
      );

      if (clickedIndex >= 0 && clickedIndex < items.length) {
        lastSelectedIndexRef.current = clickedIndex;
        onValueChange(items[clickedIndex]);
        const newScrollPos = clickedIndex * ROW_HEIGHT;
        target.scrollTop = newScrollPos;
        setScrollTop(newScrollPos);

        if (snapTimeoutRef.current !== null) {
          window.clearTimeout(snapTimeoutRef.current);
          snapTimeoutRef.current = null;
        }
      }
    };

    const handleWheelCapture = (e: React.WheelEvent<HTMLDivElement>) => {
      e.stopPropagation();
    };

    const handleTouchMoveCapture = (e: React.TouchEvent<HTMLDivElement>) => {
      e.stopPropagation();
    };

    return (
      <div
        ref={drumRef}
        onScroll={handleScroll}
        onClick={handleClick}
        onWheelCapture={handleWheelCapture}
        onTouchMoveCapture={handleTouchMoveCapture}
        className={cn('relative overflow-y-scroll scrollbar-hide', columnWidth)}
        style={{
          height: DRUM_HEIGHT,
          scrollSnapType: 'y mandatory',
          scrollBehavior: 'smooth',
          overscrollBehavior: 'contain',
          touchAction: 'pan-y',
          WebkitOverflowScrolling: 'touch',
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
            className={cn(
              'flex items-center justify-center text-sm leading-none transition-colors',
              item === selectedValue
                ? 'font-semibold text-foreground'
                : 'font-medium text-muted-foreground',
            )}
          >
            {item}
          </div>
        ))}

        {/* Bottom padding */}
        <div style={{ height: PADDING_ROWS * ROW_HEIGHT }} />

        {/* Vertical fade for wheel depth */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-7 bg-gradient-to-b from-background to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-7 bg-gradient-to-t from-background to-transparent" />
      </div>
    );
  },
);

DrumColumn.displayName = 'DrumColumn';

const TimePicker = React.forwardRef<HTMLButtonElement, TimePickerProps>(
  ({ className, value, onChange, placeholder = 'Select time', disabled, minTime }, ref) => {
    const [open, setOpen] = React.useState(false);
    const hoursRef = React.useRef<HTMLDivElement>(null);
    const minutesRef = React.useRef<HTMLDivElement>(null);
    const periodRef = React.useRef<HTMLDivElement>(null);

    const [hours, setHours] = React.useState('12');
    const [minutes, setMinutes] = React.useState('00');
    const [period, setPeriod] = React.useState<TimePeriod>('AM');

    // Initialize from value — or from minTime, so an empty end time starts the
    // drums next to its start time rather than at midnight
    React.useEffect(() => {
      if (!open) return;

      const initial = value ? value.split(' ')[0] : minTime;
      if (!initial) return;

      const { hours: h, minutes: m, period: p } = splitTime(initial);
      setHours(h);
      setMinutes(m);
      setPeriod(p);
    }, [value, open, minTime]);

    const selectedTime = React.useMemo(() => {
      let hour24 = parseInt(hours, 10);
      if (period === 'PM' && hour24 !== 12) {
        hour24 += 12;
      } else if (period === 'AM' && hour24 === 12) {
        hour24 = 0;
      }
      return `${hour24.toString().padStart(2, '0')}:${minutes.padStart(2, '0')}`;
    }, [hours, minutes, period]);

    const isBeforeMin = minTime ? toMinutes(selectedTime) <= toMinutes(minTime) : false;

    const handleSave = () => {
      if (isBeforeMin) return;

      onChange?.(selectedTime);
      setOpen(false);
    };

    const getDisplayValue = () => (value ? formatTimeLabel(value) : placeholder);

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
            <IconComponent iconName="Clock01Icon" size={18} className="text-gray-800" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto rounded-xl border border-border bg-background p-0 shadow-lg"
          align="start"
        >
          <div className="relative px-3 pt-3">
            <div className="relative">
              <div className="flex items-center gap-1">
                {/* Hours */}
                <DrumColumn
                  open={open}
                  drumRef={hoursRef}
                  items={HOURS_ARRAY}
                  onValueChange={(h) => {
                    setHours(h);
                  }}
                  selectedValue={hours}
                  columnWidth="w-9"
                />

                {/* Separator */}
                <div className="flex h-[140px] items-center px-0.5 text-sm font-semibold text-foreground">
                  :
                </div>

                {/* Minutes */}
                <DrumColumn
                  open={open}
                  drumRef={minutesRef}
                  items={MINUTES_ARRAY}
                  onValueChange={(m) => {
                    setMinutes(m);
                  }}
                  selectedValue={minutes}
                  columnWidth="w-9"
                />

                {/* Period */}
                <DrumColumn
                  open={open}
                  drumRef={periodRef}
                  items={PERIOD_ARRAY}
                  onValueChange={(p) => {
                    setPeriod(p as TimePeriod);
                  }}
                  selectedValue={period}
                  columnWidth="w-10"
                />
              </div>

              {/* Shared center indicator */}
              <div
                className="pointer-events-none absolute left-0 right-0 rounded-md border border-border/70 bg-muted/35"
                style={{
                  top: (DRUM_HEIGHT - ROW_HEIGHT) / 2,
                  height: ROW_HEIGHT,
                }}
              />
            </div>
          </div>

          {isBeforeMin && minTime && (
            <p className="px-3 pb-1 pt-2 text-center text-[11px] text-destructive">
              Must be after {formatTimeLabel(minTime)}
            </p>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-border px-3 py-2.5">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-xs font-medium text-destructive hover:text-destructive/80"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isBeforeMin}
              className="text-xs font-medium text-foreground hover:text-foreground/80 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:text-foreground"
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
