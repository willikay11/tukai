'use client';

import { TimePicker } from '@/components/ui/time-picker';
import { TicketDateBadge } from '../TicketDateBadge/TicketDateBadge';

interface DateBadgeWithTimesProps {
  startDate: string | null;
  endDate: string | null;
  startTime: string | null;
  endTime: string | null;
  onStartTimeChange: (value: string) => void;
  onEndTimeChange: (value: string) => void;
  errors: Record<string, string>;
}

export const DateBadgeWithTimes = ({
  startDate,
  endDate,
  startTime,
  endTime,
  onStartTimeChange,
  onEndTimeChange,
  errors,
}: DateBadgeWithTimesProps) => {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-6">
      <div className="flex-1">
        {startDate && endDate ? (
          <TicketDateBadge
            mode="multi-day-range"
            startDate={startDate}
            endDate={endDate}
          />
        ) : null}
      </div>

      <div className="flex flex-1 gap-3 lg:flex-none lg:w-auto">
        <div className="flex-1 lg:flex-none lg:min-w-[140px]">
          <TimePicker
            value={startTime || undefined}
            onChange={onStartTimeChange}
            placeholder="Start Time"
          />
          {errors.startTime && <p className="mt-1 text-xs text-red-500">{errors.startTime}</p>}
        </div>

        <div className="flex-1 lg:flex-none lg:min-w-[140px]">
          <TimePicker
            value={endTime || undefined}
            onChange={onEndTimeChange}
            placeholder="End Time"
          />
          {errors.endTime && <p className="mt-1 text-xs text-red-500">{errors.endTime}</p>}
        </div>
      </div>
    </div>
  );
};
