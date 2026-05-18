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
    <div className="flex flex-col gap-2 lg:flex-row lg:justify-between">
      <div className="w-full lg:w-fit">
        {startDate && endDate ? (
          <TicketDateBadge
            mode="multi-day-range"
            startDate={startDate}
            endDate={endDate}
          />
        ) : null}
      </div>

      <div className="flex w-full gap-2 lg:w-fit">
        <div className="flex-1">
          <TimePicker
            value={startTime || undefined}
            onChange={onStartTimeChange}
            placeholder="Start Time"
          />
          {errors.startTime && <p className="mt-1 text-xs text-red-500">{errors.startTime}</p>}
        </div>

        <div className="flex-1">
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
