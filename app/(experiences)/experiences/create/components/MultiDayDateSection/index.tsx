'use client';

import { useCallback } from 'react';

import { DatePicker } from '@/components/ui/date-picker';
import { TimePicker } from '@/components/ui/time-picker';
import { isEndAfterStart } from '@/utils/itinerary-utils';

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
  // Times only need ordering when both ends fall on the same day — across
  // different days an earlier end time is perfectly valid
  const isSameDay = !!startDate && !!endDate && startDate === endDate;
  const endTimeOrderError =
    isSameDay && !isEndAfterStart(startTime, endTime) ? 'End time must be after start time' : null;

  return (
    <div className="space-y-2">
      <label className="block text-xs font-medium text-gray-900">Select Experience date(s)</label>
      <div className="grid grid-cols-2 gap-2">
        <div>
          {/* <label className="block text-xs font-medium text-gray-900 mb-2">Start Date</label> */}
          <DatePicker
            value={startDate || undefined}
            onChange={onStartDateChange}
            minDate={new Date()}
            placeholder="Start date"
          />
          {errors.multiDayStartDate && (
            <p className="mt-1 text-xs text-red-500">{errors.multiDayStartDate}</p>
          )}
        </div>

        <div>
          {/* <label className="block text-xs font-medium text-gray-900 mb-2">Start Time</label> */}
          <TimePicker
            value={startTime || undefined}
            onChange={onStartTimeChange}
            placeholder="Select time"
          />
          {errors.multiDayStartTime && (
            <p className="mt-1 text-xs text-red-500">{errors.multiDayStartTime}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          {/* <label className="block text-xs font-medium text-gray-900 mb-2">End Date</label> */}
          <DatePicker
            value={endDate || undefined}
            onChange={onEndDateChange}
            // The experience can't end before it starts — same constraint as
            // the itinerary and recurrence date pickers
            minDate={startDate ? new Date(startDate) : new Date()}
            placeholder="End date"
          />
          {errors.multiDayEndDate && (
            <p className="mt-1 text-xs text-red-500">{errors.multiDayEndDate}</p>
          )}
        </div>

        <div>
          {/* <label className="block text-xs font-medium text-gray-900 mb-2">End Time</label> */}
          <TimePicker
            value={endTime || undefined}
            onChange={onEndTimeChange}
            placeholder="Select time"
            minTime={isSameDay ? startTime || undefined : undefined}
          />
          {(errors.multiDayEndTime || endTimeOrderError) && (
            <p className="mt-1 text-xs text-red-500">
              {errors.multiDayEndTime || endTimeOrderError}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
