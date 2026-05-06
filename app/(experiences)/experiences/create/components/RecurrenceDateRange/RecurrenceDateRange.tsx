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
          />
          {errors.recurrenceStartDate && (
            <p className="text-xs text-red-500 mt-1">{errors.recurrenceStartDate}</p>
          )}
        </div>

        <div>
          <DatePicker
            value={endDate || undefined}
            onChange={onEndDateChange}
            placeholder="End Date"
          />
          {errors.recurrenceEndDate && (
            <p className="text-xs text-red-500 mt-1">{errors.recurrenceEndDate}</p>
          )}
        </div>
      </div>
    </div>
  );
};
