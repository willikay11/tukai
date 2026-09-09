'use client';

import { cn } from '@/lib/utils';

/** The API numbers days 0 = Monday … 6 = Sunday, so this order is the mapping. */
export const WEEKDAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const;

export type Weekday = (typeof WEEKDAYS)[number];

/**
 * A choice among pills, carrying the same top-to-bottom green as the gradient
 * button and the pill radio group once picked.
 */
export const SelectablePill = ({
  label,
  isSelected,
  onClick,
}: {
  label: string;
  isSelected: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    aria-pressed={isSelected}
    onClick={onClick}
    className={cn(
      'rounded-full px-4 py-2 text-xs font-medium transition-colors',
      isSelected
        ? 'bg-gradient-to-b from-[#047857] to-[#064E3B] text-white shadow-sm'
        : 'bg-gray-100 text-gray-800 hover:bg-gray-200',
    )}
  >
    {label}
  </button>
);

/**
 * The days a place keeps — shared by its listed opening hours and by the days
 * it accepts reservations, which are asked for the same way but stored
 * differently.
 */
export const WeekdayPills = ({
  label = 'Active days of the week',
  selected,
  onChange,
}: {
  label?: string;
  selected: string[];
  onChange: (days: string[]) => void;
}) => (
  <div className="space-y-2">
    <p className="text-xs font-medium text-gray-800">{label}</p>
    <div className="flex flex-wrap gap-2">
      {WEEKDAYS.map((day) => (
        <SelectablePill
          key={day}
          label={day}
          isSelected={selected.includes(day)}
          onClick={() =>
            onChange(
              selected.includes(day)
                ? selected.filter((entry) => entry !== day)
                : [...selected, day],
            )
          }
        />
      ))}
    </div>
  </div>
);
