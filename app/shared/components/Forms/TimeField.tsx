'use client';

import { useMemo, useRef, useState } from 'react';

import { IconComponent } from '@/app/shared/components/Icons';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

const STEP_MINUTES = 15;
const MINUTES_PER_DAY = 24 * 60;

const toMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return NaN;
  return hours * 60 + minutes;
};

const toValue = (minutes: number): string =>
  `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;

/** "13:30" -> "1:30 PM" */
const formatTimeLabel = (time: string): string => {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours, 10);
  if (!Number.isFinite(hour)) return time;

  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;

  return `${displayHour}:${minutes} ${period}`;
};

/** Minutes -> "2 hrs 30 mins" / "45 mins" / "1 hr" */
const formatDuration = (totalMinutes: number): string => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours} ${hours === 1 ? 'hr' : 'hrs'}`);
  if (minutes > 0) parts.push(`${minutes} ${minutes === 1 ? 'min' : 'mins'}`);
  return parts.length ? parts.join(' ') : '0 mins';
};

const ALL_SLOTS: string[] = Array.from({ length: MINUTES_PER_DAY / STEP_MINUTES }, (_, index) =>
  toValue(index * STEP_MINUTES),
);

export interface TimeFieldProps {
  label: string;
  value: string | null; // "HH:MM", 24-hour
  onChange: (value: string) => void;
  /** Lists only times after this one, and shows each option's duration from it (and the field's own duration once a value is picked). */
  afterTime?: string | null;
  /** Times already used elsewhere that day - shown disabled with a "Taken by {label}" note. */
  takenTimes?: { time: string; label: string }[];
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * The canvas's Time field: a 15-minute-step list in a popover (tk-pop /
 * tk-tlist). When `afterTime` is given (picking an end time against a known
 * start), the list starts just after it and each option - and the field's
 * own value once chosen - shows the duration from that reference.
 */
export const TimeField = ({
  label,
  value,
  onChange,
  afterTime,
  takenTimes = [],
  placeholder,
  error,
  disabled,
  className,
}: TimeFieldProps) => {
  const [open, setOpen] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const takenByTime = useMemo(() => {
    const map = new Map<string, string>();
    takenTimes.forEach(({ time, label: takenLabel }) => map.set(time, takenLabel));
    return map;
  }, [takenTimes]);

  const options = useMemo(() => {
    const floor = afterTime ? toMinutes(afterTime) : NaN;
    let slots = Number.isFinite(floor)
      ? ALL_SLOTS.filter((slot) => toMinutes(slot) > floor)
      : [...ALL_SLOTS];

    // Keep a stored off-grid value selectable rather than dropping it
    if (value && !slots.includes(value)) {
      slots = [...slots, value].sort((a, b) => toMinutes(a) - toMinutes(b));
    }

    return slots;
  }, [afterTime, value]);

  const refMinutes = afterTime ? toMinutes(afterTime) : NaN;
  const valueMinutes = value ? toMinutes(value) : NaN;
  const duration =
    Number.isFinite(refMinutes) && Number.isFinite(valueMinutes) && valueMinutes > refMinutes
      ? formatDuration(valueMinutes - refMinutes)
      : null;

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <Popover
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (next) {
            requestAnimationFrame(() => {
              const selectedEl = listRef.current?.querySelector('[aria-selected="true"]');
              selectedEl?.scrollIntoView({ block: 'center' });
            });
          }
        }}
      >
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
              {value ? (
                <>
                  <span className="text-[12.5px] leading-tight text-ink-muted">{label}</span>
                  <span className="flex items-baseline gap-1.5 truncate text-15 leading-tight text-gray-800 [font-variant-numeric:tabular-nums]">
                    {formatTimeLabel(value)}
                    {duration && (
                      <span className="truncate text-[13.5px] text-ink-muted">· {duration}</span>
                    )}
                  </span>
                </>
              ) : (
                <span className="truncate text-15 leading-tight text-ink-muted">
                  {placeholder ?? label}
                </span>
              )}
            </span>
            <IconComponent
              iconName="Clock02Icon"
              size={20}
              color="#5B6B66"
              className="flex-shrink-0"
            />
          </button>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          sideOffset={6}
          className="w-[--radix-popover-trigger-width] min-w-[240px] rounded-[18px] p-1.5 shadow-[0_0_0_1px_rgba(1,51,52,.06),0_14px_36px_rgba(1,51,52,.16)]"
        >
          <div
            ref={listRef}
            className="flex max-h-[288px] flex-col gap-0.5 overflow-y-auto overscroll-contain"
          >
            {options.length === 0 ? (
              <p className="px-3 py-4 text-center text-[14px] text-ink-muted">
                No times left after {afterTime ? formatTimeLabel(afterTime) : 'the start time'}
              </p>
            ) : (
              options.map((slot) => {
                const isSelected = slot === value;
                const taken = takenByTime.get(slot);
                const slotMinutes = toMinutes(slot);
                const slotDuration =
                  Number.isFinite(refMinutes) && slotMinutes > refMinutes
                    ? formatDuration(slotMinutes - refMinutes)
                    : null;

                return (
                  <button
                    key={slot}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    aria-disabled={Boolean(taken)}
                    disabled={Boolean(taken)}
                    onClick={() => {
                      onChange(slot);
                      setOpen(false);
                    }}
                    className={cn(
                      'flex min-h-11 items-center gap-2.5 rounded-xl px-3 text-left text-15 text-gray-800 outline-none [font-variant-numeric:tabular-nums]',
                      'hover:bg-surface focus:shadow-[inset_0_0_0_2px_#066349]',
                      isSelected && 'bg-surface-brand font-semibold text-brand-ink',
                      taken && 'pointer-events-none text-[#A3AEA9]',
                    )}
                  >
                    <span className="min-w-0 flex-1">{formatTimeLabel(slot)}</span>
                    {taken ? (
                      <span className="min-w-0 flex-shrink truncate text-[12.5px] text-[#8A9793]">
                        Taken by {taken}
                      </span>
                    ) : slotDuration ? (
                      <span className="flex-shrink-0 text-[13.5px] text-ink-muted">
                        {slotDuration}
                      </span>
                    ) : null}
                    {isSelected && (
                      <IconComponent
                        iconName="Tick02Icon"
                        size={18}
                        color="#066349"
                        className="flex-shrink-0"
                      />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </PopoverContent>
      </Popover>

      {error && <span className="text-[13.5px] leading-tight text-danger-deep">{error}</span>}
    </div>
  );
};

export { formatTimeLabel, formatDuration };
