'use client';

import moment from 'moment';

import { IconComponent } from '@/app/shared/components/Icons';
import { ALL_DAYS, dayKey } from '@/utils/reservation-calendar';

/**
 * The chrome above a reservations list: a month stepper, a count, and a pill
 * per day that has something on it. The rows themselves belong to the caller —
 * an experience booking and a table reservation read very differently.
 */
export const MonthDayFilter = ({
  monthCursor,
  days,
  countLabel,
  selectedKey,
  daysWithItems,
  onChangeMonth,
  onSelectKey,
}: {
  monthCursor: moment.Moment;
  days: Date[];
  countLabel: string;
  selectedKey: string;
  // Day keys that hold at least one item, for the dot on the pill
  daysWithItems: Set<string>;
  onChangeMonth: (delta: number) => void;
  onSelectKey: (key: string) => void;
}) => (
  <>
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChangeMonth(-1)}
          aria-label="Previous month"
          className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100"
        >
          <IconComponent iconName="ArrowLeft01Icon" size={16} color="currentColor" />
        </button>
        <span className="text-lg font-bold text-gray-900">{monthCursor.format('MMMM')}</span>
        <button
          type="button"
          onClick={() => onChangeMonth(1)}
          aria-label="Next month"
          className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100"
        >
          <IconComponent iconName="ArrowRight01Icon" size={16} color="currentColor" />
        </button>
      </div>

      <span className="flex-shrink-0 text-sm text-gray-400">{countLabel}</span>
    </div>

    <div className="mt-4 flex items-center gap-2 overflow-x-auto scrollbar-hide">
      <button
        type="button"
        onClick={() => onSelectKey(ALL_DAYS)}
        aria-pressed={selectedKey === ALL_DAYS}
        className={`flex-shrink-0 rounded-full border px-5 py-2.5 text-sm ${
          selectedKey === ALL_DAYS
            ? 'border-transparent bg-green-200 font-semibold text-gray-900'
            : 'border-gray-200 bg-white text-gray-700'
        }`}
      >
        All
      </button>

      {days.map((day) => {
        const key = dayKey(day);
        const isSelected = key === selectedKey;

        return (
          <button
            key={key}
            type="button"
            onClick={() => onSelectKey(key)}
            aria-pressed={isSelected}
            className={`flex flex-shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 text-sm ${
              isSelected
                ? 'border-transparent bg-green-200 font-semibold text-gray-900'
                : 'border-gray-200 bg-white text-gray-700'
            }`}
          >
            <span>{moment(day).format('ddd')}</span>
            <span className="font-bold">{day.getDate()}</span>
            {daysWithItems.has(key) && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
          </button>
        );
      })}
    </div>
  </>
);
