'use client';

import { DatePicker } from '@/components/ui/date-picker';

interface RecurrenceDateRangeProps {
  startDate: string | null;
  endDate: string | null;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  errors: Record<string, string>;
}

export const RecurrenceDateRange = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  errors,
}: RecurrenceDateRangeProps) => {
  return (
    <div className="space-y-2">
      <label className="block text-xs font-medium text-gray-900">
        Recurrence start and end dates
      </label>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <DatePicker
            value={startDate || undefined}
            onChange={onStartDateChange}
            placeholder="Start Date"
            minDate={new Date()}
          />
          {errors.recurrenceStartDate && (
            <p className="mt-1 text-xs text-red-500">{errors.recurrenceStartDate}</p>
          )}
        </div>

        <div>
          <DatePicker
            value={endDate || undefined}
            onChange={onEndDateChange}
            placeholder="End Date"
            // The recurrence window can't end before it starts — same
            // constraint as the itinerary date pickers
            minDate={startDate ? new Date(startDate) : new Date()}
          />
          {errors.recurrenceEndDate && (
            <p className="mt-1 text-xs text-red-500">{errors.recurrenceEndDate}</p>
          )}
        </div>
      </div>
    </div>
  );
};
