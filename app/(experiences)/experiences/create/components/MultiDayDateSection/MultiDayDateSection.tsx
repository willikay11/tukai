'use client';

import { useCallback } from 'react';
import { DatePicker } from '@/components/ui/date-picker';
import { TimePicker } from '@/components/ui/time-picker';

interface MultiDaySectionProps {
  startDate: string | null;
  startTime: string | null;
  endDate: string | null;
  endTime: string | null;
  onStartDateChange: (date: string) => void;
  onStartTimeChange: (time: string) => void;
  onEndDateChange: (date: string) => void;
  onEndTimeChange: (time: string) => void;
  errors: Record<string, string>;
}

export const MultiDayDateSection = ({
  startDate,
  startTime,
  endDate,
  endTime,
  onStartDateChange,
  onStartTimeChange,
  onEndDateChange,
  onEndTimeChange,
  errors,
}: MultiDaySectionProps) => {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-xs font-medium text-gray-900 mb-2">Start Date</label>
        <DatePicker value={startDate || undefined} onChange={onStartDateChange} />
        {errors.multiDayStartDate && (
          <p className="text-xs text-red-500 mt-1">{errors.multiDayStartDate}</p>
        )}
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-900 mb-2">Start Time</label>
        <TimePicker
          value={startTime || undefined}
          onChange={onStartTimeChange}
          placeholder="Select time"
        />
        {errors.multiDayStartTime && (
          <p className="text-xs text-red-500 mt-1">{errors.multiDayStartTime}</p>
        )}
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-900 mb-2">End Date</label>
        <DatePicker value={endDate || undefined} onChange={onEndDateChange} />
        {errors.multiDayEndDate && (
          <p className="text-xs text-red-500 mt-1">{errors.multiDayEndDate}</p>
        )}
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-900 mb-2">End Time</label>
        <TimePicker
          value={endTime || undefined}
          onChange={onEndTimeChange}
          placeholder="Select time"
        />
        {errors.multiDayEndTime && (
          <p className="text-xs text-red-500 mt-1">{errors.multiDayEndTime}</p>
        )}
      </div>
    </div>
  );
};
